'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCopy, IconCheck, IconClear } from './icons';

interface OutputTerminalProps {
  lines: string[];
  status?: 'idle' | 'running' | 'completed' | 'failed';
  maxHeight?: string;
  onClear?: () => void;
  showLineNumbers?: boolean;
}

export function OutputTerminal({
  lines,
  status = 'idle',
  maxHeight = '300px',
  onClear,
  showLineNumbers = false,
}: OutputTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const handleCopy = async () => {
    const text = lines.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    idle: 'bg-[var(--navy-700)]',
    running: 'bg-[var(--purple-glow)]/20',
    completed: 'bg-[var(--green-glow)]/20',
    failed: 'bg-[var(--red-glow)]/20',
  };

  const statusBorderColors = {
    idle: 'border-[var(--navy-600)]',
    running: 'border-[var(--purple-glow)]/50',
    completed: 'border-[var(--green-glow)]/50',
    failed: 'border-[var(--red-glow)]/50',
  };

  return (
    <div className={`rounded-lg border ${statusBorderColors[status]} ${statusColors[status]} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--navy-600)] bg-[var(--navy-800)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[var(--red-glow)]/60" />
            <div className="w-3 h-3 rounded-full bg-[var(--yellow-glow)]/60" />
            <div className="w-3 h-3 rounded-full bg-[var(--green-glow)]/60" />
          </div>
          <span className="text-xs text-[var(--navy-400)] ml-2">Output</span>
          {status === 'running' && (
            <span className="text-xs text-[var(--purple-glow)] animate-pulse">Running...</span>
          )}
          {status === 'completed' && (
            <span className="text-xs text-[var(--green-glow)]">Completed</span>
          )}
          {status === 'failed' && (
            <span className="text-xs text-[var(--red-glow)]">Failed</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!autoScroll && status === 'running' && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (containerRef.current) {
                  containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
              }}
              className="p-1 text-[var(--navy-400)] hover:text-[var(--cyan-glow)] transition-colors text-xs"
              title="Resume auto-scroll"
            >
              Follow
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 text-[var(--navy-400)] hover:text-[var(--cyan-glow)] transition-colors"
            title="Copy output"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="p-1 text-[var(--navy-400)] hover:text-[var(--red-glow)] transition-colors"
              title="Clear output"
            >
              <IconClear size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-auto font-mono text-sm p-3"
        style={{ maxHeight }}
      >
        {lines.length === 0 ? (
          <div className="text-[var(--navy-500)] italic">
            {status === 'idle' ? 'Waiting for execution...' : 'No output yet...'}
          </div>
        ) : (
          <div className="space-y-0.5">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="text-[var(--navy-500)] select-none mr-3 w-8 text-right">
                    {index + 1}
                  </span>
                )}
                <span className={`whitespace-pre-wrap break-all ${getLineColor(line)}`}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        )}
        {status === 'running' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-4 bg-[var(--cyan-glow)] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to color code output lines based on content
function getLineColor(line: string): string {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('error') || lowerLine.includes('failed') || lowerLine.includes('fatal')) {
    return 'text-[var(--red-glow)]';
  }
  if (lowerLine.includes('warning') || lowerLine.includes('warn')) {
    return 'text-[var(--yellow-glow)]';
  }
  if (lowerLine.includes('success') || lowerLine.includes('done') || lowerLine.includes('found')) {
    return 'text-[var(--green-glow)]';
  }
  if (line.startsWith('[') || line.startsWith('>')) {
    return 'text-[var(--cyan-glow)]';
  }
  return 'text-[var(--navy-200)]';
}
