'use client';

import { useState } from 'react';
import { LogEntry } from '@/app/types';
import { IconX, IconSearch, IconLoader } from '@/app/components/ui/icons';

interface LogsPanelProps {
  logs: LogEntry[];
  isExecuting: boolean;
  currentCommand?: string;
  onClear: () => void;
}

const LOG_LEVEL_CLASSES: Record<string, string> = {
  info: 'log-info',
  success: 'log-success',
  warning: 'log-warning',
  error: 'log-error',
};

const LOG_LEVEL_PREFIXES: Record<string, string> = {
  info: '[INFO]',
  success: '[SUCCESS]',
  warning: '[WARN]',
  error: '[ERROR]',
};

export function LogsPanel({ logs, isExecuting, currentCommand, onClear }: LogsPanelProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tool.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Execution Logs</h3>
          {isExecuting && (
            <div className="flex items-center gap-2 text-sm text-[var(--purple-scan)]">
              <IconLoader size={16} />
              Running...
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <IconSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
            />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 py-1.5 text-sm w-48"
            />
          </div>

          {/* Level Filter */}
          <div className="tab-list">
            {['all', 'info', 'success', 'warning', 'error'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`tab text-xs py-1.5 px-3 ${filter === level ? 'active' : ''}`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          {/* Clear */}
          <button
            onClick={onClear}
            className="btn btn-ghost py-1.5 px-3 text-sm"
            title="Clear logs"
          >
            <IconX size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Current Command */}
      {currentCommand && (
        <div className="px-4 py-3 bg-[var(--navy-800)] border-b border-[var(--border)] font-mono text-sm">
          <span className="text-[var(--cyan-glow)]">$ </span>
          <span className="text-[var(--foreground)]">{currentCommand}</span>
        </div>
      )}

      {/* Logs */}
      <div className="flex-1 overflow-y-auto font-mono text-sm">
        {filteredLogs.length > 0 ? (
          <div className="p-4 space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="log-line group hover:bg-[var(--navy-800)] px-2 py-1 -mx-2 rounded">
                <span className="log-timestamp w-24 flex-shrink-0">{log.timestamp}</span>
                <span className={`w-20 flex-shrink-0 ${LOG_LEVEL_CLASSES[log.level]}`}>
                  {LOG_LEVEL_PREFIXES[log.level]}
                </span>
                <span className="text-[var(--purple-scan)] w-24 flex-shrink-0">[{log.tool}]</span>
                <span className="text-[var(--foreground)] flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full text-[var(--foreground-dim)]">
            <div className="text-center py-16">
              <div className="terminal-dot w-4 h-4 mx-auto mb-4 bg-[var(--navy-600)]" />
              <p>No logs yet</p>
              <p className="text-xs mt-1">Execute a tool to see output here</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--navy-950)] text-xs text-[var(--foreground-dim)] flex items-center justify-between">
        <span>{filteredLogs.length} entries</span>
        <span>Auto-scroll enabled</span>
      </div>
    </div>
  );
}
