'use client';

import { useState, useEffect, useRef } from 'react';
import { EnhancedLogEntry, ExecutionJob } from '@/app/types';
import { IconX, IconSearch, IconLoader, IconDownload, IconCheck, IconCopy } from '@/app/components/ui/icons';

interface LogsPanelProps {
  logs: EnhancedLogEntry[];
  isExecuting: boolean;
  currentCommand?: string;
  onClear: () => void;
  activeJobs?: ExecutionJob[];
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

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function ExitCodeBadge({ code }: { code: number }) {
  if (code === 0) {
    return (
      <span className="badge badge-green text-[10px] py-0 ml-2">
        Exit: 0
      </span>
    );
  }
  return (
    <span className="badge badge-red text-[10px] py-0 ml-2">
      Exit: {code}
    </span>
  );
}

export function LogsPanel({
  logs,
  isExecuting,
  currentCommand,
  onClear,
  activeJobs = [],
}: LogsPanelProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.command && log.command.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Group logs by jobId
  const groupedByJob = filteredLogs.reduce((acc, log) => {
    const key = log.jobId || 'ungrouped';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(log);
    return acc;
  }, {} as Record<string, EnhancedLogEntry[]>);

  const handleExport = () => {
    const content = filteredLogs
      .map((log) => {
        let line = `${log.timestamp} ${LOG_LEVEL_PREFIXES[log.level]} [${log.tool}] ${log.message}`;
        if (log.command) line += `\n  Command: ${log.command}`;
        if (log.exitCode !== undefined) line += `\n  Exit Code: ${log.exitCode}`;
        if (log.duration) line += `\n  Duration: ${formatDuration(log.duration)}`;
        return line;
      })
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLogs = async () => {
    const content = filteredLogs
      .map((log) => `${log.timestamp} ${LOG_LEVEL_PREFIXES[log.level]} [${log.tool}] ${log.message}`)
      .join('\n');
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runningJobsCount = activeJobs.filter((j) => j.status === 'running').length;
  const queuedJobsCount = activeJobs.filter((j) => j.status === 'queued').length;

  return (
    <div className="h-full flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Execution Logs</h3>
          {(isExecuting || runningJobsCount > 0) && (
            <div className="flex items-center gap-2 text-sm text-[var(--purple-scan)]">
              <IconLoader size={16} />
              {runningJobsCount} running
              {queuedJobsCount > 0 && (
                <span className="text-[var(--foreground-dim)]">
                  ({queuedJobsCount} queued)
                </span>
              )}
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

          {/* Copy */}
          <button
            onClick={handleCopyLogs}
            className="btn btn-ghost py-1.5 px-3 text-sm"
            title="Copy logs"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="btn btn-ghost py-1.5 px-3 text-sm"
            title="Export logs"
          >
            <IconDownload size={14} />
          </button>

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
      <div
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-sm"
      >
        {filteredLogs.length > 0 ? (
          <div className="p-4 space-y-1">
            {filteredLogs.map((log, index) => {
              // Check if this is the first log of a new job (show command header)
              const isNewJob =
                log.jobId &&
                log.command &&
                (index === 0 || filteredLogs[index - 1]?.jobId !== log.jobId);

              return (
                <div key={log.id}>
                  {/* Command Header */}
                  {isNewJob && (
                    <div className="mt-4 mb-2 pt-4 border-t border-[var(--navy-700)]">
                      <div className="flex items-center gap-2 text-xs text-[var(--foreground-dim)] mb-1">
                        <span className="font-semibold text-[var(--purple-scan)]">{log.tool}</span>
                        <span>-</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {log.exitCode !== undefined && <ExitCodeBadge code={log.exitCode} />}
                        {log.duration && (
                          <span className="text-[var(--foreground-dim)]">
                            ({formatDuration(log.duration)})
                          </span>
                        )}
                      </div>
                      <div className="px-2 py-1.5 bg-[var(--navy-950)] rounded border border-[var(--navy-700)]">
                        <span className="text-[var(--cyan-glow)]">$ </span>
                        <span className="text-[var(--foreground-muted)]">{log.command}</span>
                      </div>
                    </div>
                  )}

                  {/* Log Line */}
                  <div className="log-line group hover:bg-[var(--navy-800)] px-2 py-1 -mx-2 rounded">
                    <span className="log-timestamp w-24 flex-shrink-0">{log.timestamp}</span>
                    <span className={`w-20 flex-shrink-0 ${LOG_LEVEL_CLASSES[log.level]}`}>
                      {LOG_LEVEL_PREFIXES[log.level]}
                    </span>
                    <span className="text-[var(--purple-scan)] w-24 flex-shrink-0">[{log.tool}]</span>
                    <span className="text-[var(--foreground)] flex-1">{log.message}</span>
                  </div>
                </div>
              );
            })}
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
        <div className="flex items-center gap-4">
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (logsContainerRef.current) {
                  logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                }
              }}
              className="text-[var(--cyan-glow)] hover:underline"
            >
              Resume auto-scroll
            </button>
          )}
          <span>{autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}</span>
        </div>
      </div>
    </div>
  );
}
