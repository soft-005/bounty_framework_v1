// KSA Bug Bounty Framework Types

export type ToolCategory =
  | 'recon'
  | 'dns'
  | 'scanning'
  | 'discovery'
  | 'ports'
  | 'cloud'
  | 'osint'
  | 'external';

export type ToolType = 'cli' | 'external';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  type: ToolType;
  // For CLI tools
  command?: string;
  flags?: ToolFlag[];
  installed?: boolean;
  // For external tools (web-based)
  baseUrl?: string;
  queryTemplate?: string; // Use {target} as placeholder
  externalLinks?: ExternalLink[];
}

export interface ExternalLink {
  label: string;
  urlTemplate: string; // Use {target} as placeholder
}

export interface ToolFlag {
  flag: string;
  description: string;
  required: boolean;
  type: 'string' | 'boolean' | 'number';
  default?: string | boolean | number;
  usesTarget?: boolean; // If true, auto-fill with active target
}

export interface Target {
  id: string;
  name: string;
  domain: string;
  scope: string[];
  outOfScope: string[];
  createdAt: string;
  notes: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  tool: string;
  message: string;
}

export interface ExecutionResult {
  id: string;
  toolId: string;
  command: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  output: string[];
  exitCode?: number;
}

// Workspace represents a single project/engagement
export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activeTargetId: string | null;
  targets: Target[];
  notes: Note[];
  settings: WorkspaceSettings;
}

export interface WorkspaceState {
  version: string;
  activeWorkspaceId: string | null;
  workspaces: WorkspaceMeta[];
}

export interface WorkspaceMeta {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
  targetCount: number;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light';
  autoSave: boolean;
  logRetention: number;
}

export interface Note {
  id: string;
  targetId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'tools' | 'logs' | 'notes' | 'reports' | 'settings';

// Execution job for parallel tool runs
export interface ExecutionJob {
  id: string;
  toolId: string;
  toolName: string;
  command: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  output: string[];
  exitCode?: number;
  targetId?: string;
}

export interface ExecutionState {
  jobs: ExecutionJob[];
  maxConcurrent: number;
}

// Reporting types
export type ReportChecklistCategory = 'basic' | 'technical' | 'evidence' | 'impact';

export interface ReportChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
  category: ReportChecklistCategory;
}

export type VulnerabilitySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'draft' | 'ready' | 'submitted';

export interface VulnerabilityReport {
  id: string;
  targetId: string;
  title: string;
  severity: VulnerabilitySeverity;
  vulnerabilityType: string;
  description: string;
  stepsToReproduce: string;
  impact: string;
  remediation?: string;
  linkedNoteIds: string[];
  checklist: ReportChecklistItem[];
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

// Enhanced log entry with command details
export interface EnhancedLogEntry extends LogEntry {
  jobId?: string;
  command?: string;
  exitCode?: number;
  duration?: number;
}

// Execution settings
export interface ExecutionSettings {
  useDocker: boolean;
  dockerHost: string;
  maxConcurrentJobs: number;
  outputBufferSize: number;
}
