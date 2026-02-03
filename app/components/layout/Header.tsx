'use client';

import { IconBug, IconShield, IconStop, IconLoader } from '@/app/components/ui/icons';

interface HeaderProps {
  title: string;
  runningCount?: number;
  queuedCount?: number;
  onStopAll?: () => void;
}

export function Header({ title, runningCount = 0, queuedCount = 0, onStopAll }: HeaderProps) {
  const totalActive = runningCount + queuedCount;

  return (
    <header className="h-[56px] border-b border-[var(--border)] bg-[var(--navy-900)]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="hidden md:flex items-center gap-2">
          <span className="badge badge-cyan">
            <IconShield size={12} />
            Recon Mode
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Running Jobs Indicator & Stop All Button */}
        {totalActive > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <IconLoader size={14} className="text-[var(--cyan-glow)]" />
              <span className="text-[var(--foreground-muted)]">
                <span className="font-semibold text-[var(--cyan-bright)]">{runningCount}</span> running
                {queuedCount > 0 && (
                  <span className="ml-1">
                    / <span className="font-semibold text-[var(--amber-warning)]">{queuedCount}</span> queued
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={onStopAll}
              className="btn btn-danger py-1.5 px-3 text-xs flex items-center gap-1.5"
              title="Stop all running and queued commands"
            >
              <IconStop size={12} />
              Stop All
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <IconBug size={16} className="text-[var(--red-alert)]" />
            <span className="text-[var(--foreground-muted)]">
              <span className="font-semibold text-[var(--foreground)]">0</span> Findings
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
