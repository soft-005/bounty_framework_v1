'use client';

import { useState, useEffect } from 'react';
import { Tool, ToolCategory, Target } from '@/app/types';
import { TOOLS, TOOL_CATEGORIES } from '@/app/lib/tools-data';
import {
  IconPlay,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
  IconCopy,
  IconCheck,
  IconGlobe,
} from '@/app/components/ui/icons';

interface ToolsPanelProps {
  activeTarget: Target | null;
  onExecute: (command: string, tool: Tool) => void;
}

export function ToolsPanel({ activeTarget, onExecute }: ToolsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['recon', 'scanning', 'external'])
  );
  const [commandInput, setCommandInput] = useState('');
  const [copied, setCopied] = useState(false);

  const targetDomain = activeTarget?.domain || '';

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setExpandedCategories(next);
  };

  // Build command with target value
  const buildDefaultCommand = (tool: Tool, target: string): string => {
    if (tool.type === 'external') return '';

    let cmd = tool.command || '';
    tool.flags?.forEach((flag) => {
      if (flag.usesTarget && target) {
        // Use target for this flag
        if (flag.flag) {
          cmd += ` ${flag.flag} ${target}`;
        } else {
          // Positional argument
          cmd += ` ${target}`;
        }
      } else if (flag.required && !flag.usesTarget) {
        cmd += ` ${flag.flag} <${flag.description}>`;
      } else if (flag.default !== undefined && flag.type === 'boolean' && flag.default) {
        cmd += ` ${flag.flag}`;
      }
    });
    return cmd;
  };

  const selectTool = (tool: Tool) => {
    setSelectedTool(tool);
    if (tool.type === 'cli') {
      const defaultCmd = buildDefaultCommand(tool, targetDomain);
      setCommandInput(defaultCmd);
    }
  };

  // Update command when target changes
  useEffect(() => {
    if (selectedTool && selectedTool.type === 'cli') {
      const defaultCmd = buildDefaultCommand(selectedTool, targetDomain);
      setCommandInput(defaultCmd);
    }
  }, [targetDomain, selectedTool]);

  const handleCopy = () => {
    navigator.clipboard.writeText(commandInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    if (selectedTool && commandInput) {
      onExecute(commandInput, selectedTool);
    }
  };

  const openExternalLink = (urlTemplate: string) => {
    const url = urlTemplate.replace(/{target}/g, targetDomain || 'example.com');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredTools = TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, Tool[]>);

  return (
    <div className="flex h-full gap-4">
      {/* Tools List */}
      <div className="w-80 flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
            />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Target Indicator */}
        {activeTarget && (
          <div className="px-4 py-2 bg-[var(--navy-800)] border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs">
              <IconGlobe size={12} className="text-[var(--cyan-glow)]" />
              <span className="text-[var(--foreground-dim)]">Target:</span>
              <span className="font-medium text-[var(--cyan-bright)]">{activeTarget.domain}</span>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(TOOL_CATEGORIES).map(([categoryId, category]) => {
            const tools = groupedTools[categoryId as ToolCategory] || [];
            if (tools.length === 0) return null;

            const isExpanded = expandedCategories.has(categoryId);

            return (
              <div key={categoryId} className="mb-2">
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--navy-800)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className={`badge badge-${category.color} text-[10px] py-0.5`}>
                      {tools.length}
                    </span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </span>
                  {isExpanded ? (
                    <IconChevronDown size={16} className="text-[var(--foreground-dim)]" />
                  ) : (
                    <IconChevronRight size={16} className="text-[var(--foreground-dim)]" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-2 space-y-0.5">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => selectTool(tool)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                          selectedTool?.id === tool.id
                            ? 'bg-[var(--navy-700)] text-[var(--cyan-glow)] border-l-2 border-[var(--cyan-glow)]'
                            : 'text-[var(--foreground-muted)] hover:bg-[var(--navy-800)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tool.name}</span>
                          {tool.type === 'external' && (
                            <IconGlobe size={12} className="text-[var(--foreground-dim)]" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--foreground-dim)] mt-0.5 line-clamp-1">
                          {tool.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Command Panel */}
      <div className="flex-1 flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {selectedTool ? (
          <>
            {/* Tool Header */}
            <div className="p-5 border-b border-[var(--border)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-3">
                    {selectedTool.name}
                    <span
                      className={`badge badge-${TOOL_CATEGORIES[selectedTool.category].color}`}
                    >
                      {TOOL_CATEGORIES[selectedTool.category].label}
                    </span>
                    {selectedTool.type === 'external' && (
                      <span className="badge badge-purple">Web Tool</span>
                    )}
                  </h3>
                  <p className="text-[var(--foreground-muted)] mt-1">
                    {selectedTool.description}
                  </p>
                </div>
                {selectedTool.type === 'cli' && (
                  <div className="flex items-center gap-2">
                    {selectedTool.installed ? (
                      <span className="badge badge-green">Installed</span>
                    ) : (
                      <span className="badge badge-amber">Not Installed</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CLI Tool: Command Input */}
            {selectedTool.type === 'cli' && (
              <>
                <div className="p-5 border-b border-[var(--border)]">
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground-muted)]">
                    Command
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-[var(--cyan-glow)] font-mono text-sm border-r border-[var(--border)] bg-[var(--navy-950)] rounded-l-lg">
                        $
                      </div>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        className="input-command w-full pl-12 pr-12 py-3"
                        placeholder="Enter command..."
                      />
                      <button
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--navy-700)] rounded transition-colors"
                        title="Copy command"
                      >
                        {copied ? (
                          <IconCheck size={16} className="text-[var(--green-terminal)]" />
                        ) : (
                          <IconCopy size={16} className="text-[var(--foreground-dim)]" />
                        )}
                      </button>
                    </div>
                    <button onClick={handleExecute} className="btn btn-primary px-6">
                      <IconPlay size={16} />
                      Run
                    </button>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex-1 overflow-y-auto p-5">
                  <h4 className="text-sm font-medium mb-4 text-[var(--foreground-muted)]">
                    Available Flags
                  </h4>
                  <div className="space-y-3">
                    {selectedTool.flags?.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-[var(--cyan-glow)] font-mono text-sm">
                            {flag.flag || '(positional)'}
                          </code>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--foreground-dim)]">
                              {flag.type}
                            </span>
                            {flag.usesTarget && (
                              <span className="badge badge-cyan text-[10px] py-0">Uses Target</span>
                            )}
                            {flag.required && (
                              <span className="badge badge-red text-[10px] py-0">Required</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[var(--foreground-muted)]">{flag.description}</p>
                        {flag.default !== undefined && (
                          <p className="text-xs text-[var(--foreground-dim)] mt-1">
                            Default: <code className="text-[var(--cyan-bright)]">{String(flag.default)}</code>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* External Tool: Links */}
            {selectedTool.type === 'external' && (
              <div className="flex-1 overflow-y-auto p-5">
                <h4 className="text-sm font-medium mb-4 text-[var(--foreground-muted)]">
                  Quick Links {targetDomain && <span className="text-[var(--cyan-bright)]">for {targetDomain}</span>}
                </h4>

                {!activeTarget && (
                  <div className="p-4 rounded-lg bg-[var(--amber-warning)]/10 border border-[var(--amber-warning)]/30 mb-4">
                    <p className="text-sm text-[var(--amber-warning)]">
                      Set an active target to generate links with your domain
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedTool.externalLinks?.map((link, idx) => {
                    const url = link.urlTemplate.replace(/{target}/g, targetDomain || 'example.com');
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[var(--navy-800)] border border-[var(--border)] hover:border-[var(--cyan-bright)] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{link.label}</span>
                          <button
                            onClick={() => openExternalLink(link.urlTemplate)}
                            className="btn btn-primary py-1.5 px-4 text-sm"
                          >
                            <IconGlobe size={14} />
                            Open
                          </button>
                        </div>
                        <code className="text-xs text-[var(--foreground-dim)] block truncate">
                          {url}
                        </code>
                      </div>
                    );
                  })}
                </div>

                {/* Base URL */}
                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--foreground-dim)] mb-2">Base URL</p>
                  <a
                    href={selectedTool.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--cyan-bright)] hover:underline"
                  >
                    {selectedTool.baseUrl}
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--foreground-dim)]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--navy-800)] flex items-center justify-center">
                <IconChevronRight size={32} className="text-[var(--navy-500)]" />
              </div>
              <p className="text-lg font-medium">Select a tool</p>
              <p className="text-sm mt-1">Choose a tool from the list to configure and run</p>
              {!activeTarget && (
                <p className="text-xs mt-3 text-[var(--amber-warning)]">
                  Tip: Set an active target to auto-fill commands
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
