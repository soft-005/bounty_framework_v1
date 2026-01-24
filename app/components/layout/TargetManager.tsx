'use client';

import { useState } from 'react';
import { Target } from '@/app/types';
import {
  IconTarget,
  IconPlus,
  IconChevronDown,
  IconX,
  IconCheck,
  IconGlobe,
} from '@/app/components/ui/icons';

interface TargetManagerProps {
  targets: Target[];
  activeTarget: Target | null;
  onSelect: (id: string) => void;
  onCreate: (target: Omit<Target, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Target>) => void;
  onDelete: (id: string) => void;
}

export function TargetManager({
  targets,
  activeTarget,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: TargetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    scope: '',
    outOfScope: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({ name: '', domain: '', scope: '', outOfScope: '', notes: '' });
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
  };

  const startEdit = () => {
    if (activeTarget) {
      setFormData({
        name: activeTarget.name,
        domain: activeTarget.domain,
        scope: activeTarget.scope.join('\n'),
        outOfScope: activeTarget.outOfScope.join('\n'),
        notes: activeTarget.notes,
      });
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleSubmit = () => {
    const targetData = {
      name: formData.name.trim(),
      domain: formData.domain.trim(),
      scope: formData.scope.split('\n').map(s => s.trim()).filter(Boolean),
      outOfScope: formData.outOfScope.split('\n').map(s => s.trim()).filter(Boolean),
      notes: formData.notes.trim(),
    };

    if (!targetData.name || !targetData.domain) return;

    if (isEditing && activeTarget) {
      onUpdate(activeTarget.id, targetData);
    } else {
      onCreate(targetData);
    }

    resetForm();
    setIsCreating(false);
    setIsEditing(false);
  };

  const showForm = isCreating || isEditing;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <IconTarget size={16} />
          Active Target
          <IconChevronDown
            size={14}
            className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>
        <button
          onClick={startCreate}
          className="btn btn-ghost py-1 px-2 text-xs"
          title="Add target"
        >
          <IconPlus size={14} />
        </button>
      </div>

      {/* Target Selector */}
      {isOpen && !showForm && (
        <div className="space-y-2">
          {/* Active Target Display */}
          {activeTarget ? (
            <div className="p-3 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconGlobe size={16} className="text-[var(--cyan-glow)]" />
                  <span className="font-medium text-sm">{activeTarget.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={startEdit}
                    className="btn btn-ghost py-0.5 px-2 text-[10px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${activeTarget.name}"?`)) {
                        onDelete(activeTarget.id);
                      }
                    }}
                    className="btn btn-ghost py-0.5 px-2 text-[10px] text-[var(--red-alert)]"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--foreground-dim)] mt-1">{activeTarget.domain}</p>
              {activeTarget.scope.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--border)]">
                  <p className="text-[10px] text-[var(--foreground-dim)] mb-1">In Scope:</p>
                  <div className="flex flex-wrap gap-1">
                    {activeTarget.scope.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--navy-700)] text-[var(--cyan-bright)]"
                      >
                        {s}
                      </span>
                    ))}
                    {activeTarget.scope.length > 3 && (
                      <span className="text-[10px] text-[var(--foreground-dim)]">
                        +{activeTarget.scope.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={startCreate}
              className="w-full p-3 rounded-lg border border-dashed border-[var(--border)] text-[var(--foreground-dim)] hover:border-[var(--cyan-bright)] hover:text-[var(--cyan-bright)] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <IconPlus size={16} />
              Add Target
            </button>
          )}

          {/* Other Targets */}
          {targets.length > 1 && (
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--foreground-dim)] px-1">Other targets</p>
              {targets
                .filter(t => t.id !== activeTarget?.id)
                .map(target => (
                  <button
                    key={target.id}
                    onClick={() => onSelect(target.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[var(--navy-800)] transition-colors"
                  >
                    <p className="text-sm font-medium">{target.name}</p>
                    <p className="text-xs text-[var(--foreground-dim)]">{target.domain}</p>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">
              {isEditing ? 'Edit Target' : 'New Target'}
            </h4>
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                resetForm();
              }}
              className="btn btn-ghost py-1 px-2"
            >
              <IconX size={14} />
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-[var(--foreground-dim)] mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Acme Corp"
              className="input py-2 text-sm"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-xs text-[var(--foreground-dim)] mb-1">
              Primary Domain *
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="e.g., example.com"
              className="input py-2 text-sm"
            />
          </div>

          {/* Scope */}
          <div>
            <label className="block text-xs text-[var(--foreground-dim)] mb-1">
              In Scope (one per line)
            </label>
            <textarea
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              placeholder="*.example.com&#10;api.example.com&#10;app.example.com"
              className="input py-2 text-sm resize-none h-20"
            />
          </div>

          {/* Out of Scope */}
          <div>
            <label className="block text-xs text-[var(--foreground-dim)] mb-1">
              Out of Scope (one per line)
            </label>
            <textarea
              value={formData.outOfScope}
              onChange={(e) => setFormData({ ...formData, outOfScope: e.target.value })}
              placeholder="staging.example.com&#10;dev.example.com"
              className="input py-2 text-sm resize-none h-16"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-[var(--foreground-dim)] mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the target..."
              className="input py-2 text-sm resize-none h-16"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                resetForm();
              }}
              className="btn btn-ghost py-1.5 px-3 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.domain.trim()}
              className="btn btn-primary py-1.5 px-4 text-sm"
            >
              <IconCheck size={14} />
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
