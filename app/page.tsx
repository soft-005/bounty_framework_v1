'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ViewMode, EnhancedLogEntry, Note, Tool, Workspace, WorkspaceMeta, Target, WorkspaceSettings, VulnerabilityReport } from '@/app/types';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Header } from '@/app/components/layout/Header';
import { ExecutionBanner } from '@/app/components/layout/ExecutionBanner';
import { ToolsPanel } from '@/app/components/panels/ToolsPanel';
import { LogsPanel } from '@/app/components/panels/LogsPanel';
import { NotesPanel } from '@/app/components/panels/NotesPanel';
import { ReportingPanel } from '@/app/components/panels/ReportingPanel';
import { SettingsPanel } from '@/app/components/panels/SettingsPanel';
import { useExecution } from '@/app/hooks/useExecution';
import {
  loadWorkspaceStateAsync,
  saveWorkspaceStateAsync,
  loadWorkspaceAsync,
  saveWorkspace,
  createWorkspaceAsync,
  renameWorkspace,
  deleteWorkspace,
  addTarget,
  updateTarget,
  deleteTarget,
  setActiveTarget,
  addNote,
  updateNote,
  deleteNote,
  addReport,
  updateReport as updateReportInWorkspace,
  deleteReport as deleteReportFromWorkspace,
  addLog as addLogToWorkspace,
  clearLogs as clearLogsInWorkspace,
  generateId,
  setCachedState,
  setCachedWorkspace,
} from '@/app/lib/workspace';

const VIEW_TITLES: Record<ViewMode, string> = {
  tools: 'Security Tools',
  logs: 'Execution Logs',
  notes: 'Notes & Findings',
  reports: 'Vulnerability Reports',
  settings: 'Settings',
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('tools');
  const [logs, setLogs] = useState<EnhancedLogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string | undefined>();

  // Workspace state
  const [workspaces, setWorkspaces] = useState<WorkspaceMeta[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  // Reports state (stored per workspace)
  const [reports, setReports] = useState<VulnerabilityReport[]>([]);

  // Track which jobs have been logged to prevent duplicate logging
  const loggedJobsRef = useRef<Set<string>>(new Set());

  // Execution hook for parallel tool execution (max 5 concurrent)
  const {
    jobs,
    runningCount,
    queuedCount,
    startExecution,
    cancelExecution,
    cancelAllRunning,
    clearCompleted,
    getActiveJobForTool,
    getJobsForTool,
  } = useExecution(5);

  // Derived state
  const activeTarget = activeWorkspace?.targets.find(t => t.id === activeWorkspace.activeTargetId) || null;
  const notes = activeWorkspace?.notes || [];
  const settings = activeWorkspace?.settings || { theme: 'dark', autoSave: true, logRetention: 100 };

  // Apply theme when settings change
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  // Load workspace state on mount (client-side only)
  useEffect(() => {
    async function loadData() {
      const state = await loadWorkspaceStateAsync();
      setCachedState(state);
      setWorkspaces(state.workspaces);

      if (state.activeWorkspaceId) {
        const workspace = await loadWorkspaceAsync(state.activeWorkspaceId);
        if (workspace) {
          setCachedWorkspace(workspace);
          setActiveWorkspace(workspace);
          // Load reports and logs from workspace
          setReports(workspace.reports || []);
          setLogs(workspace.logs || []);
        }
      }

      // Create default workspace if none exists
      if (state.workspaces.length === 0) {
        const newWorkspace = await createWorkspaceAsync('My First Project');
        setCachedWorkspace(newWorkspace);
        setWorkspaces([{
          id: newWorkspace.id,
          name: newWorkspace.name,
          filename: 'my-first-project',
          createdAt: newWorkspace.createdAt,
          updatedAt: newWorkspace.updatedAt,
          targetCount: 0,
        }]);
        setActiveWorkspace(newWorkspace);
      }

      // Set mounted after all data is loaded
      setMounted(true);
    }

    loadData();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKSPACE HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelectWorkspace = useCallback(async (id: string) => {
    const workspace = await loadWorkspaceAsync(id);
    if (workspace) {
      setCachedWorkspace(workspace);
      setActiveWorkspace(workspace);
      // Load reports and logs from the new workspace
      setReports(workspace.reports || []);
      setLogs(workspace.logs || []);
      const state = await loadWorkspaceStateAsync();
      state.activeWorkspaceId = id;
      await saveWorkspaceStateAsync(state);
      setCachedState(state);
    }
  }, []);

  const handleCreateWorkspace = useCallback(async (name: string) => {
    const newWorkspace = await createWorkspaceAsync(name);
    setCachedWorkspace(newWorkspace);
    setActiveWorkspace(newWorkspace);
    setWorkspaces(prev => [...prev, {
      id: newWorkspace.id,
      name: newWorkspace.name,
      filename: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: newWorkspace.createdAt,
      updatedAt: newWorkspace.updatedAt,
      targetCount: 0,
    }]);
  }, []);

  const handleRenameWorkspace = useCallback((id: string, name: string) => {
    renameWorkspace(id, name);
    setWorkspaces(prev => prev.map(w =>
      w.id === id ? { ...w, name, updatedAt: new Date().toISOString() } : w
    ));
    if (activeWorkspace?.id === id) {
      setActiveWorkspace(prev => prev ? { ...prev, name } : null);
    }
  }, [activeWorkspace]);

  const handleDeleteWorkspace = useCallback(async (id: string) => {
    deleteWorkspace(id);
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (activeWorkspace?.id === id) {
      const state = await loadWorkspaceStateAsync();
      if (state.workspaces.length > 0) {
        const nextWorkspace = await loadWorkspaceAsync(state.workspaces[0].id);
        if (nextWorkspace) {
          setCachedWorkspace(nextWorkspace);
        }
        setActiveWorkspace(nextWorkspace);
      } else {
        setActiveWorkspace(null);
      }
    }
  }, [activeWorkspace]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TARGET HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelectTarget = useCallback((id: string) => {
    if (!activeWorkspace) return;
    setActiveTarget(activeWorkspace.id, id);
    setActiveWorkspace(prev => prev ? { ...prev, activeTargetId: id } : null);
  }, [activeWorkspace]);

  const handleCreateTarget = useCallback((targetData: Omit<Target, 'id' | 'createdAt'>) => {
    if (!activeWorkspace) return;
    const newTarget = addTarget(activeWorkspace.id, targetData);
    setActiveWorkspace(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        targets: [...prev.targets, newTarget],
        activeTargetId: prev.targets.length === 0 ? newTarget.id : prev.activeTargetId,
      };
      return updated;
    });
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspace.id ? { ...w, targetCount: w.targetCount + 1 } : w
    ));
  }, [activeWorkspace]);

  const handleUpdateTarget = useCallback((id: string, updates: Partial<Target>) => {
    if (!activeWorkspace) return;
    updateTarget(activeWorkspace.id, id, updates);
    setActiveWorkspace(prev => {
      if (!prev) return null;
      return {
        ...prev,
        targets: prev.targets.map(t => t.id === id ? { ...t, ...updates } : t),
      };
    });
  }, [activeWorkspace]);

  const handleDeleteTarget = useCallback((id: string) => {
    if (!activeWorkspace) return;
    deleteTarget(activeWorkspace.id, id);
    // Remove reports for deleted target
    const reportsToKeep = reports.filter(r => r.targetId !== id);
    setReports(reportsToKeep);
    setActiveWorkspace(prev => {
      if (!prev) return null;
      const newTargets = prev.targets.filter(t => t.id !== id);
      return {
        ...prev,
        targets: newTargets,
        activeTargetId: prev.activeTargetId === id ? (newTargets[0]?.id || null) : prev.activeTargetId,
        notes: prev.notes.filter(n => n.targetId !== id),
        reports: (prev.reports || []).filter(r => r.targetId !== id),
      };
    });
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspace.id ? { ...w, targetCount: Math.max(0, w.targetCount - 1) } : w
    ));
  }, [activeWorkspace, reports]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSaveNote = useCallback((noteData: Partial<Note>) => {
    if (!activeWorkspace) return;

    if (noteData.id) {
      // Update existing
      updateNote(activeWorkspace.id, noteData.id, noteData);
      setActiveWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: prev.notes.map(n =>
            n.id === noteData.id
              ? { ...n, ...noteData, updatedAt: new Date().toISOString() }
              : n
          ),
        };
      });
    } else {
      // Create new
      const newNote = addNote(activeWorkspace.id, {
        targetId: activeTarget?.id || 'default',
        title: noteData.title || 'Untitled',
        content: noteData.content || '',
        tags: noteData.tags || [],
      });
      setActiveWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [newNote, ...prev.notes],
        };
      });
    }
  }, [activeWorkspace, activeTarget]);

  const handleDeleteNote = useCallback((id: string) => {
    if (!activeWorkspace) return;
    deleteNote(activeWorkspace.id, id);
    setActiveWorkspace(prev => {
      if (!prev) return null;
      return {
        ...prev,
        notes: prev.notes.filter(n => n.id !== id),
      };
    });
  }, [activeWorkspace]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreateReport = useCallback((report: VulnerabilityReport) => {
    if (!activeWorkspace) return;
    addReport(activeWorkspace.id, report);
    setReports(prev => [report, ...prev]);
    // Update workspace state
    setActiveWorkspace(prev => prev ? { ...prev, reports: [report, ...(prev.reports || [])] } : null);
  }, [activeWorkspace]);

  const handleUpdateReport = useCallback((report: VulnerabilityReport) => {
    if (!activeWorkspace) return;
    updateReportInWorkspace(activeWorkspace.id, report.id, report);
    setReports(prev => prev.map(r => r.id === report.id ? report : r));
    // Update workspace state
    setActiveWorkspace(prev => prev ? {
      ...prev,
      reports: (prev.reports || []).map(r => r.id === report.id ? report : r)
    } : null);
  }, [activeWorkspace]);

  const handleDeleteReport = useCallback((reportId: string) => {
    if (!activeWorkspace) return;
    deleteReportFromWorkspace(activeWorkspace.id, reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
    // Update workspace state
    setActiveWorkspace(prev => prev ? {
      ...prev,
      reports: (prev.reports || []).filter(r => r.id !== reportId)
    } : null);
  }, [activeWorkspace]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSaveSettings = useCallback((newSettings: WorkspaceSettings) => {
    if (!activeWorkspace) return;
    const updated = { ...activeWorkspace, settings: newSettings };
    saveWorkspace(updated);
    setActiveWorkspace(updated);
  }, [activeWorkspace]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TOOL EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  const addLogEntry = useCallback((
    level: EnhancedLogEntry['level'],
    tool: string,
    message: string,
    jobId?: string,
    command?: string,
    exitCode?: number,
    duration?: number
  ) => {
    const newLog: EnhancedLogEntry = {
      id: generateId(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level,
      tool,
      message,
      jobId,
      command,
      exitCode,
      duration,
    };
    setLogs((prev) => [...prev.slice(-(settings.logRetention - 1)), newLog]);
    // Persist to workspace
    if (activeWorkspace) {
      addLogToWorkspace(activeWorkspace.id, newLog, settings.logRetention);
    }
  }, [settings.logRetention, activeWorkspace]);

  // Log execution job status changes (only once per job)
  useEffect(() => {
    jobs.forEach((job) => {
      if ((job.status === 'completed' || job.status === 'failed') &&
          !loggedJobsRef.current.has(job.id)) {
        // Mark as logged to prevent duplicate entries
        loggedJobsRef.current.add(job.id);

        const duration = job.endTime && job.startTime
          ? new Date(job.endTime).getTime() - new Date(job.startTime).getTime()
          : 0;

        addLogEntry(
          job.status === 'completed' ? 'success' : 'error',
          job.toolName,
          `Execution ${job.status}: ${job.command}`,
          job.id,
          job.command,
          job.exitCode,
          duration
        );
      }
    });
  }, [jobs, addLogEntry]);

  const handleExecute = useCallback(
    (command: string, tool: Tool) => {
      // Use the execution hook for real parallel execution
      const job = startExecution(command, tool, activeTarget?.id);

      addLogEntry('info', tool.name, `Started execution: ${command}`, job.id, command);
      setIsExecuting(true);
      setCurrentCommand(command);

      // Clear executing state when no more jobs are running
      setTimeout(() => {
        if (runningCount === 0) {
          setIsExecuting(false);
          setCurrentCommand(undefined);
        }
      }, 100);
    },
    [startExecution, addLogEntry, activeTarget, runningCount]
  );

  const handleCancelExecution = useCallback(
    (jobId: string) => {
      cancelExecution(jobId);
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        addLogEntry('warning', job.toolName, `Execution cancelled: ${job.command}`, jobId, job.command);
      }
    },
    [cancelExecution, jobs, addLogEntry]
  );

  const handleClearLogs = useCallback(() => {
    setLogs([]);
    // Persist to workspace
    if (activeWorkspace) {
      clearLogsInWorkspace(activeWorkspace.id);
      setActiveWorkspace(prev => prev ? { ...prev, logs: [] } : null);
    }
  }, [activeWorkspace]);

  // Prevent hydration mismatch by showing loading state until client-side mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background)] bg-grid noise-overlay flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[var(--cyan-glow)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)] text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid noise-overlay">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onRenameWorkspace={handleRenameWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        activeTarget={activeTarget}
        onSelectTarget={handleSelectTarget}
        onCreateTarget={handleCreateTarget}
        onUpdateTarget={handleUpdateTarget}
        onDeleteTarget={handleDeleteTarget}
      />

      {/* Main Content */}
      <main className="ml-[260px] min-h-screen flex flex-col">
        <Header
          title={VIEW_TITLES[activeView]}
          runningCount={runningCount}
          queuedCount={queuedCount}
          onStopAll={cancelAllRunning}
        />

        {/* Execution Banner - shows when tools are running */}
        <ExecutionBanner
          jobs={jobs}
          onCancel={handleCancelExecution}
          onClearCompleted={clearCompleted}
        />

        <div className="flex-1 p-6">
          {activeView === 'tools' && (
            <ToolsPanel
              activeTarget={activeTarget}
              onExecute={handleExecute}
              onCancel={handleCancelExecution}
              getActiveJobForTool={getActiveJobForTool}
              getJobsForTool={getJobsForTool}
            />
          )}

          {activeView === 'logs' && (
            <LogsPanel
              logs={logs}
              isExecuting={isExecuting || runningCount > 0}
              currentCommand={currentCommand}
              onClear={handleClearLogs}
              activeJobs={jobs}
            />
          )}

          {activeView === 'notes' && (
            <NotesPanel
              notes={notes}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          )}

          {activeView === 'reports' && (
            <ReportingPanel
              reports={reports}
              notes={notes}
              activeTarget={activeTarget}
              onCreateReport={handleCreateReport}
              onUpdateReport={handleUpdateReport}
              onDeleteReport={handleDeleteReport}
            />
          )}

          {activeView === 'settings' && (
            <SettingsPanel
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
}
