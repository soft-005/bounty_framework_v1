'use client';

import { ViewMode, Workspace, WorkspaceMeta, Target } from '@/app/types';
import {
  IconRadar,
  IconTools,
  IconLogs,
  IconNotes,
  IconSettings,
} from '@/app/components/ui/icons';
import { WorkspaceSelector } from './WorkspaceSelector';
import { TargetManager } from './TargetManager';

interface SidebarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  // Workspace props
  workspaces: WorkspaceMeta[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  // Target props
  activeTarget: Target | null;
  onSelectTarget: (id: string) => void;
  onCreateTarget: (target: Omit<Target, 'id' | 'createdAt'>) => void;
  onUpdateTarget: (id: string, updates: Partial<Target>) => void;
  onDeleteTarget: (id: string) => void;
}

const NAV_ITEMS = [
  { id: 'tools' as ViewMode, label: 'Tools', icon: IconTools },
  { id: 'logs' as ViewMode, label: 'Logs', icon: IconLogs },
  { id: 'notes' as ViewMode, label: 'Notes', icon: IconNotes },
  { id: 'settings' as ViewMode, label: 'Settings', icon: IconSettings },
];

export function Sidebar({
  activeView,
  onViewChange,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  activeTarget,
  onSelectTarget,
  onCreateTarget,
  onUpdateTarget,
  onDeleteTarget,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[var(--navy-900)] border-r border-[var(--border)] flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cyan-glow)] to-[var(--purple-scan)] flex items-center justify-center">
            <IconRadar size={22} className="text-[var(--navy-950)]" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-gradient">KSA</h1>
            <p className="text-xs text-[var(--foreground-dim)]">Bug Bounty Framework</p>
          </div>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="p-4 border-b border-[var(--border)]">
        <WorkspaceSelector
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSelect={onSelectWorkspace}
          onCreate={onCreateWorkspace}
          onRename={onRenameWorkspace}
          onDelete={onDeleteWorkspace}
        />
      </div>

      {/* Target Manager */}
      {activeWorkspace && (
        <div className="p-4 border-b border-[var(--border)]">
          <TargetManager
            targets={activeWorkspace.targets}
            activeTarget={activeTarget}
            onSelect={onSelectTarget}
            onCreate={onCreateTarget}
            onUpdate={onUpdateTarget}
            onDelete={onDeleteTarget}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--navy-700)] text-[var(--cyan-glow)] border-l-2 border-[var(--cyan-glow)]'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--navy-800)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Bar */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--navy-800)]">
          <div className="status-dot success" />
          <div className="flex-1">
            <p className="text-xs font-medium">System Ready</p>
            <p className="text-xs text-[var(--foreground-dim)]">
              {activeWorkspace
                ? `${activeWorkspace.targets.length} target${activeWorkspace.targets.length !== 1 ? 's' : ''}`
                : 'No workspace'
              }
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
