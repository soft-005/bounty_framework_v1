'use client';

import { IconSearch, IconBug, IconShield } from '@/app/components/ui/icons';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
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
        {/* Search */}
        <div className="relative">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
          />
          <input
            type="text"
            placeholder="Search tools..."
            className="input pl-10 py-2 w-64 bg-[var(--navy-800)] text-sm"
          />
        </div>

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
