'use client';

import { useState } from 'react';
import { WorkspaceSettings } from '@/app/types';
import { IconSave, IconFolder, IconCheck } from '@/app/components/ui/icons';

interface SettingsPanelProps {
  settings: WorkspaceSettings;
  onSave: (settings: WorkspaceSettings) => void;
}

export function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<WorkspaceSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-xl font-semibold">Settings</h3>
          <p className="text-[var(--foreground-muted)] mt-1">
            Configure your workspace preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="p-6 space-y-8">
          {/* Appearance */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-dim)] mb-4">
              Appearance
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="tab-list">
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
                    className={`tab text-sm py-1.5 px-4 ${
                      localSettings.theme === 'dark' ? 'active' : ''
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
                    className={`tab text-sm py-1.5 px-4 ${
                      localSettings.theme === 'light' ? 'active' : ''
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Workspace */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-dim)] mb-4">
              Workspace
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]">
                <div>
                  <p className="font-medium">Auto-save</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Automatically save workspace state
                  </p>
                </div>
                <button
                  onClick={() =>
                    setLocalSettings({ ...localSettings, autoSave: !localSettings.autoSave })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    localSettings.autoSave ? 'bg-[var(--cyan-glow)]' : 'bg-[var(--navy-600)]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      localSettings.autoSave ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]">
                <div>
                  <p className="font-medium">Log Retention</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Number of log entries to keep in memory
                  </p>
                </div>
                <select
                  value={localSettings.logRetention}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, logRetention: Number(e.target.value) })
                  }
                  className="input w-32 py-2 text-sm"
                >
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                  <option value={250}>250 entries</option>
                  <option value={500}>500 entries</option>
                  <option value={1000}>1000 entries</option>
                </select>
              </div>
            </div>
          </section>

          {/* Storage */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-dim)] mb-4">
              Storage
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconFolder size={20} className="text-[var(--cyan-glow)]" />
                    <div>
                      <p className="font-medium">Workspace Data</p>
                      <p className="text-sm text-[var(--foreground-muted)]">.tmp/workspace.json</p>
                    </div>
                  </div>
                  <span className="badge badge-green">Active</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--navy-700)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--cyan-glow)] to-[var(--purple-scan)]"
                    style={{ width: '12%' }}
                  />
                </div>
                <p className="text-xs text-[var(--foreground-dim)] mt-2">1.2 KB used</p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--red-alert)] mb-4">
              Danger Zone
            </h4>
            <div className="p-4 rounded-lg border border-[var(--red-alert)]/30 bg-[var(--red-alert)]/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--red-alert)]">Reset Workspace</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Clear all data including notes, targets, and logs
                  </p>
                </div>
                <button className="btn btn-danger py-2 px-4 text-sm">Reset All</button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] bg-[var(--navy-950)] flex items-center justify-end gap-3">
          <button className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">
            {saved ? (
              <>
                <IconCheck size={16} />
                Saved!
              </>
            ) : (
              <>
                <IconSave size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
