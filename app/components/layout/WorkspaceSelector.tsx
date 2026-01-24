'use client';

import { useState } from 'react';
import { Workspace, WorkspaceMeta } from '@/app/types';
import {
  IconFolder,
  IconPlus,
  IconChevronDown,
  IconX,
  IconCheck,
} from '@/app/components/ui/icons';

interface WorkspaceSelectorProps {
  workspaces: WorkspaceMeta[];
  activeWorkspace: Workspace | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function WorkspaceSelector({
  workspaces,
  activeWorkspace,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: WorkspaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const startEditing = (workspace: WorkspaceMeta) => {
    setEditingId(workspace.id);
    setEditName(workspace.name);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--navy-800)] border border-[var(--border)] hover:border-[var(--cyan-bright)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <IconFolder size={18} className="text-[var(--cyan-glow)]" />
          <div className="text-left">
            <p className="font-medium text-sm">
              {activeWorkspace?.name || 'No workspace'}
            </p>
            <p className="text-xs text-[var(--foreground-dim)]">
              {activeWorkspace
                ? `${activeWorkspace.targets.length} target${activeWorkspace.targets.length !== 1 ? 's' : ''}`
                : 'Select or create workspace'}
            </p>
          </div>
        </div>
        <IconChevronDown
          size={16}
          className={`text-[var(--foreground-dim)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--navy-900)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground-muted)]">
                Workspaces
              </span>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-ghost py-1 px-2 text-xs"
              >
                <IconPlus size={14} />
                New
              </button>
            </div>

            {/* Create New */}
            {isCreating && (
              <div className="p-3 border-b border-[var(--border)] bg-[var(--navy-800)]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Workspace name..."
                    className="input py-1.5 text-sm flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate();
                      if (e.key === 'Escape') setIsCreating(false);
                    }}
                  />
                  <button
                    onClick={handleCreate}
                    className="btn btn-primary py-1.5 px-3"
                    disabled={!newName.trim()}
                  >
                    <IconCheck size={14} />
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="btn btn-ghost py-1.5 px-3"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Workspace List */}
            <div className="max-h-64 overflow-y-auto">
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`group flex items-center justify-between p-3 hover:bg-[var(--navy-800)] cursor-pointer ${
                      activeWorkspace?.id === workspace.id
                        ? 'bg-[var(--navy-800)] border-l-2 border-[var(--cyan-glow)]'
                        : ''
                    }`}
                  >
                    {editingId === workspace.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="input py-1 text-sm flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(workspace.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleRename(workspace.id)}
                          className="btn btn-ghost py-1 px-2"
                        >
                          <IconCheck size={14} className="text-[var(--green-terminal)]" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-ghost py-1 px-2"
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1"
                          onClick={() => {
                            onSelect(workspace.id);
                            setIsOpen(false);
                          }}
                        >
                          <p className="font-medium text-sm">{workspace.name}</p>
                          <p className="text-xs text-[var(--foreground-dim)]">
                            {workspace.targetCount} target{workspace.targetCount !== 1 ? 's' : ''} •{' '}
                            {new Date(workspace.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(workspace);
                            }}
                            className="btn btn-ghost py-1 px-2 text-xs"
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${workspace.name}"?`)) {
                                onDelete(workspace.id);
                              }
                            }}
                            className="btn btn-ghost py-1 px-2 text-xs text-[var(--red-alert)]"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[var(--foreground-dim)]">
                  <p className="text-sm">No workspaces yet</p>
                  <p className="text-xs mt-1">Create one to get started</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
