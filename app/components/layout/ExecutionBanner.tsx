'use client';

import { useState, useEffect } from 'react';
import { ExecutionJob } from '@/app/types';
import { IconLoader, IconCheck, IconX, IconChevronDown, IconChevronRight } from '@/app/components/ui/icons';

interface ExecutionBannerProps {
  jobs: ExecutionJob[];
  onCancel?: (jobId: string) => void;
  onClearCompleted?: () => void;
}

export function ExecutionBanner({
  jobs,
  onCancel,
  onClearCompleted,
}: ExecutionBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string[]>([]);

  const runningJobs = jobs.filter((j) => j.status === 'running');
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) =>
    j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled'
  );

  // Track recently completed jobs for notification
  useEffect(() => {
    const newlyCompleted = completedJobs
      .filter((j) => !recentlyCompleted.includes(j.id))
      .map((j) => j.id);

    if (newlyCompleted.length > 0) {
      setRecentlyCompleted((prev) => [...prev, ...newlyCompleted]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setRecentlyCompleted((prev) =>
          prev.filter((id) => !newlyCompleted.includes(id))
        );
      }, 5000);
    }
  }, [completedJobs]);

  // Don't show banner if no activity
  if (jobs.length === 0) {
    return null;
  }

  const hasActivity = runningJobs.length > 0 || queuedJobs.length > 0;
  const hasCompletedRecently = recentlyCompleted.length > 0;

  if (!hasActivity && !hasCompletedRecently) {
    return null;
  }

  return (
    <div className="bg-[var(--navy-900)] border-b border-[var(--border)]">
      {/* Compact Banner */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-[var(--navy-800)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {runningJobs.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <IconLoader size={14} className="text-[var(--purple-scan)]" />
              <span className="text-[var(--purple-scan)] font-medium">
                {runningJobs.length} running
              </span>
            </div>
          )}

          {queuedJobs.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-[var(--foreground-dim)]">
              <span>{queuedJobs.length} queued</span>
            </div>
          )}

          {hasCompletedRecently && (
            <div className="flex items-center gap-2 text-sm text-[var(--green-glow)]">
              <IconCheck size={14} />
              <span>{recentlyCompleted.length} completed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {completedJobs.length > 0 && onClearCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearCompleted();
                setRecentlyCompleted([]);
              }}
              className="text-xs text-[var(--foreground-dim)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear completed
            </button>
          )}
          {expanded ? (
            <IconChevronDown size={16} className="text-[var(--foreground-dim)]" />
          ) : (
            <IconChevronRight size={16} className="text-[var(--foreground-dim)]" />
          )}
        </div>
      </div>

      {/* Expanded Job List */}
      {expanded && (
        <div className="border-t border-[var(--border)] max-h-64 overflow-y-auto">
          {runningJobs.length > 0 && (
            <div className="p-3 border-b border-[var(--navy-700)]">
              <div className="text-xs text-[var(--foreground-dim)] mb-2 uppercase tracking-wide">
                Running
              </div>
              <div className="space-y-2">
                {runningJobs.map((job) => (
                  <JobItem key={job.id} job={job} onCancel={onCancel} />
                ))}
              </div>
            </div>
          )}

          {queuedJobs.length > 0 && (
            <div className="p-3 border-b border-[var(--navy-700)]">
              <div className="text-xs text-[var(--foreground-dim)] mb-2 uppercase tracking-wide">
                Queued
              </div>
              <div className="space-y-2">
                {queuedJobs.map((job) => (
                  <JobItem key={job.id} job={job} onCancel={onCancel} />
                ))}
              </div>
            </div>
          )}

          {completedJobs.length > 0 && (
            <div className="p-3">
              <div className="text-xs text-[var(--foreground-dim)] mb-2 uppercase tracking-wide">
                Completed
              </div>
              <div className="space-y-2">
                {completedJobs.slice(0, 5).map((job) => (
                  <JobItem key={job.id} job={job} />
                ))}
                {completedJobs.length > 5 && (
                  <div className="text-xs text-[var(--foreground-dim)] text-center py-1">
                    +{completedJobs.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobItem({
  job,
  onCancel,
}: {
  job: ExecutionJob;
  onCancel?: (jobId: string) => void;
}) {
  const statusIcon = () => {
    switch (job.status) {
      case 'running':
        return <IconLoader size={12} className="text-[var(--purple-scan)]" />;
      case 'queued':
        return <div className="w-3 h-3 rounded-full bg-[var(--amber-warning)] animate-pulse" />;
      case 'completed':
        return <IconCheck size={12} className="text-[var(--green-glow)]" />;
      case 'failed':
        return <IconX size={12} className="text-[var(--red-glow)]" />;
      case 'cancelled':
        return <IconX size={12} className="text-[var(--foreground-dim)]" />;
      default:
        return null;
    }
  };

  const duration = job.endTime && job.startTime
    ? new Date(job.endTime).getTime() - new Date(job.startTime).getTime()
    : job.startTime
    ? Date.now() - new Date(job.startTime).getTime()
    : 0;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--navy-800)] text-sm">
      <div className="flex items-center gap-3 min-w-0">
        {statusIcon()}
        <span className="font-medium text-[var(--foreground)]">{job.toolName}</span>
        <code className="text-xs text-[var(--foreground-dim)] truncate max-w-[200px]">
          {job.command}
        </code>
      </div>
      <div className="flex items-center gap-3">
        {duration > 0 && (
          <span className="text-xs text-[var(--foreground-dim)]">
            {formatDuration(duration)}
          </span>
        )}
        {job.exitCode !== undefined && (
          <span
            className={`text-xs ${
              job.exitCode === 0 ? 'text-[var(--green-glow)]' : 'text-[var(--red-glow)]'
            }`}
          >
            Exit: {job.exitCode}
          </span>
        )}
        {(job.status === 'running' || job.status === 'queued') && onCancel && (
          <button
            onClick={() => onCancel(job.id)}
            className="p-1 hover:bg-[var(--navy-700)] rounded transition-colors"
            title="Cancel"
          >
            <IconX size={12} className="text-[var(--red-glow)]" />
          </button>
        )}
      </div>
    </div>
  );
}
