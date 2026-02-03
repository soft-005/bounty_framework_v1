import { Workspace, WorkspaceState, WorkspaceMeta, Target, Note, WorkspaceSettings, VulnerabilityReport, EnhancedLogEntry } from '@/app/types';

// Default settings for new workspaces
const DEFAULT_SETTINGS: WorkspaceSettings = {
  theme: 'dark',
  autoSave: true,
  logRetention: 100,
};

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate filename-safe string
export function toFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ═══════════════════════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════════════════════

async function apiGet<T>(params?: Record<string, string>): Promise<T> {
  const url = new URL('/api/workspace', window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('API request failed');
  return res.json();
}

async function apiPost(type: string, data: unknown): Promise<void> {
  const res = await fetch('/api/workspace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  });
  if (!res.ok) throw new Error('API request failed');
}

async function apiDelete(id: string): Promise<void> {
  const res = await fetch(`/api/workspace?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('API request failed');
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE STATE (index of all workspaces)
// ═══════════════════════════════════════════════════════════════════════════

export async function loadWorkspaceStateAsync(): Promise<WorkspaceState> {
  try {
    return await apiGet<WorkspaceState>();
  } catch {
    return { version: '1.0.0', activeWorkspaceId: null, workspaces: [] };
  }
}

export async function saveWorkspaceStateAsync(state: WorkspaceState): Promise<void> {
  await apiPost('state', state);
}

// Synchronous versions for backwards compatibility (uses cached data)
let cachedState: WorkspaceState | null = null;

export function loadWorkspaceState(): WorkspaceState {
  if (cachedState) return cachedState;
  return { version: '1.0.0', activeWorkspaceId: null, workspaces: [] };
}

export function saveWorkspaceState(state: WorkspaceState): void {
  cachedState = state;
  // Fire and forget - save to file in background
  saveWorkspaceStateAsync(state).catch(console.error);
}

export function setCachedState(state: WorkspaceState): void {
  cachedState = state;
}

// ═══════════════════════════════════════════════════════════════════════════
// INDIVIDUAL WORKSPACE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function loadWorkspaceAsync(id: string): Promise<Workspace | null> {
  try {
    return await apiGet<Workspace>({ id });
  } catch {
    return null;
  }
}

export async function saveWorkspaceAsync(workspace: Workspace): Promise<void> {
  workspace.updatedAt = new Date().toISOString();
  await apiPost('workspace', workspace);

  // Update workspace meta in state
  const state = await loadWorkspaceStateAsync();
  const metaIndex = state.workspaces.findIndex(w => w.id === workspace.id);
  const meta: WorkspaceMeta = {
    id: workspace.id,
    name: workspace.name,
    filename: toFilename(workspace.name),
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    targetCount: workspace.targets.length,
  };

  if (metaIndex >= 0) {
    state.workspaces[metaIndex] = meta;
  } else {
    state.workspaces.push(meta);
  }

  await saveWorkspaceStateAsync(state);
  setCachedState(state);
}

// Synchronous wrappers (fire and forget)
let cachedWorkspaces: Map<string, Workspace> = new Map();

export function loadWorkspace(id: string): Workspace | null {
  return cachedWorkspaces.get(id) || null;
}

export function saveWorkspace(workspace: Workspace): void {
  cachedWorkspaces.set(workspace.id, workspace);
  saveWorkspaceAsync(workspace).catch(console.error);
}

export function setCachedWorkspace(workspace: Workspace): void {
  cachedWorkspaces.set(workspace.id, workspace);
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE CRUD
// ═══════════════════════════════════════════════════════════════════════════

export async function deleteWorkspaceAsync(id: string): Promise<void> {
  await apiDelete(id);
  cachedWorkspaces.delete(id);

  const state = await loadWorkspaceStateAsync();
  state.workspaces = state.workspaces.filter(w => w.id !== id);
  if (state.activeWorkspaceId === id) {
    state.activeWorkspaceId = state.workspaces[0]?.id || null;
  }
  await saveWorkspaceStateAsync(state);
  setCachedState(state);
}

export function deleteWorkspace(id: string): void {
  deleteWorkspaceAsync(id).catch(console.error);
}

export async function createWorkspaceAsync(name: string): Promise<Workspace> {
  const now = new Date().toISOString();
  const workspace: Workspace = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    activeTargetId: null,
    targets: [],
    notes: [],
    reports: [],
    logs: [],
    settings: { ...DEFAULT_SETTINGS },
  };

  await saveWorkspaceAsync(workspace);

  // Set as active
  const state = await loadWorkspaceStateAsync();
  state.activeWorkspaceId = workspace.id;
  await saveWorkspaceStateAsync(state);
  setCachedState(state);

  return workspace;
}

export function createWorkspace(name: string): Workspace {
  const now = new Date().toISOString();
  const workspace: Workspace = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    activeTargetId: null,
    targets: [],
    notes: [],
    reports: [],
    logs: [],
    settings: { ...DEFAULT_SETTINGS },
  };

  saveWorkspace(workspace);

  const state = loadWorkspaceState();
  state.activeWorkspaceId = workspace.id;
  state.workspaces.push({
    id: workspace.id,
    name: workspace.name,
    filename: toFilename(workspace.name),
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    targetCount: 0,
  });
  saveWorkspaceState(state);

  return workspace;
}

export function renameWorkspace(id: string, newName: string): void {
  const workspace = loadWorkspace(id);
  if (workspace) {
    workspace.name = newName;
    saveWorkspace(workspace);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TARGET OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function addTarget(workspaceId: string, target: Omit<Target, 'id' | 'createdAt'>): Target {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  const newTarget: Target = {
    ...target,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  workspace.targets.push(newTarget);

  // Set as active if first target
  if (workspace.targets.length === 1) {
    workspace.activeTargetId = newTarget.id;
  }

  saveWorkspace(workspace);
  return newTarget;
}

export function updateTarget(workspaceId: string, targetId: string, updates: Partial<Target>): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  const targetIndex = workspace.targets.findIndex(t => t.id === targetId);
  if (targetIndex < 0) throw new Error('Target not found');

  workspace.targets[targetIndex] = { ...workspace.targets[targetIndex], ...updates };
  saveWorkspace(workspace);
}

export function deleteTarget(workspaceId: string, targetId: string): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  workspace.targets = workspace.targets.filter(t => t.id !== targetId);

  // Update active target if deleted
  if (workspace.activeTargetId === targetId) {
    workspace.activeTargetId = workspace.targets[0]?.id || null;
  }

  // Remove associated notes
  workspace.notes = workspace.notes.filter(n => n.targetId !== targetId);

  saveWorkspace(workspace);
}

export function setActiveTarget(workspaceId: string, targetId: string | null): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  workspace.activeTargetId = targetId;
  saveWorkspace(workspace);
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function addNote(workspaceId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  const now = new Date().toISOString();
  const newNote: Note = {
    ...note,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  workspace.notes.push(newNote);
  saveWorkspace(workspace);
  return newNote;
}

export function updateNote(workspaceId: string, noteId: string, updates: Partial<Note>): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  const noteIndex = workspace.notes.findIndex(n => n.id === noteId);
  if (noteIndex < 0) throw new Error('Note not found');

  workspace.notes[noteIndex] = {
    ...workspace.notes[noteIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveWorkspace(workspace);
}

export function deleteNote(workspaceId: string, noteId: string): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  workspace.notes = workspace.notes.filter(n => n.id !== noteId);
  saveWorkspace(workspace);
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function addReport(workspaceId: string, report: VulnerabilityReport): VulnerabilityReport {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  // Initialize reports array if it doesn't exist (for backwards compatibility)
  if (!workspace.reports) {
    workspace.reports = [];
  }

  workspace.reports.unshift(report);
  saveWorkspace(workspace);
  return report;
}

export function updateReport(workspaceId: string, reportId: string, updates: Partial<VulnerabilityReport>): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  if (!workspace.reports) {
    workspace.reports = [];
    return;
  }

  const reportIndex = workspace.reports.findIndex(r => r.id === reportId);
  if (reportIndex < 0) throw new Error('Report not found');

  workspace.reports[reportIndex] = {
    ...workspace.reports[reportIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveWorkspace(workspace);
}

export function deleteReport(workspaceId: string, reportId: string): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  if (!workspace.reports) return;

  workspace.reports = workspace.reports.filter(r => r.id !== reportId);
  saveWorkspace(workspace);
}

export function getReports(workspaceId: string): VulnerabilityReport[] {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) return [];
  return workspace.reports || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// LOG OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function addLog(workspaceId: string, log: EnhancedLogEntry, maxLogs: number = 100): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) return;

  // Initialize logs array if it doesn't exist (for backwards compatibility)
  if (!workspace.logs) {
    workspace.logs = [];
  }

  workspace.logs.push(log);

  // Trim to max logs based on settings
  const retention = workspace.settings?.logRetention || maxLogs;
  if (workspace.logs.length > retention) {
    workspace.logs = workspace.logs.slice(-retention);
  }

  saveWorkspace(workspace);
}

export function clearLogs(workspaceId: string): void {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) return;

  workspace.logs = [];
  saveWorkspace(workspace);
}

export function getLogs(workspaceId: string): EnhancedLogEntry[] {
  const workspace = loadWorkspace(workspaceId);
  if (!workspace) return [];
  return workspace.logs || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export async function loadGlobalSettingsAsync(): Promise<WorkspaceSettings> {
  try {
    return await apiGet<WorkspaceSettings>({ type: 'settings' });
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveGlobalSettingsAsync(settings: WorkspaceSettings): Promise<void> {
  await apiPost('settings', settings);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT/IMPORT
// ═══════════════════════════════════════════════════════════════════════════

export function exportWorkspace(id: string): string {
  const workspace = loadWorkspace(id);
  if (!workspace) throw new Error('Workspace not found');
  return JSON.stringify(workspace, null, 2);
}

export function importWorkspace(json: string): Workspace {
  const workspace = JSON.parse(json) as Workspace;
  // Generate new ID to avoid conflicts
  workspace.id = generateId();
  workspace.createdAt = new Date().toISOString();
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace(workspace);
  return workspace;
}
