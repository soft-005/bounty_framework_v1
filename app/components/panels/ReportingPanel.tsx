'use client';

import { useState, useCallback } from 'react';
import { VulnerabilityReport, Note, Target, ReportChecklistItem } from '@/app/types';
import {
  IconPlus,
  IconSearch,
  IconDownload,
  IconCheck,
  IconX,
  IconChevronRight,
} from '@/app/components/ui/icons';
import {
  createReport,
  getChecklistProgress,
  isReportReady,
  exportToMarkdown,
  generateExportFilename,
  exportToPythonFormat,
  generatePythonExportFilename,
  VULNERABILITY_TYPES,
  SEVERITY_DEFINITIONS,
  CHECKLIST_CATEGORIES,
} from '@/app/lib/reporting';

interface ReportingPanelProps {
  reports: VulnerabilityReport[];
  notes: Note[];
  activeTarget: Target | null;
  onCreateReport: (report: VulnerabilityReport) => void;
  onUpdateReport: (report: VulnerabilityReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export function ReportingPanel({
  reports,
  notes,
  activeTarget,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
}: ReportingPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<VulnerabilityReport | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Filter reports for active target
  const targetReports = reports.filter(
    (r) => !activeTarget || r.targetId === activeTarget.id
  );

  const filteredReports = targetReports.filter((report) => {
    const matchesSearch =
      searchQuery === '' ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.vulnerabilityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleCreateReport = useCallback(() => {
    if (!activeTarget) return;
    const newReport = createReport(activeTarget.id);
    onCreateReport(newReport);
    setSelectedReport(newReport);
  }, [activeTarget, onCreateReport]);

  const handleUpdateField = useCallback(
    (field: keyof VulnerabilityReport, value: unknown) => {
      if (!selectedReport) return;
      const updated = {
        ...selectedReport,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };
      onUpdateReport(updated);
      setSelectedReport(updated);
    },
    [selectedReport, onUpdateReport]
  );

  const handleToggleChecklistItem = useCallback(
    (itemId: string) => {
      if (!selectedReport) return;
      const updatedChecklist = selectedReport.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      handleUpdateField('checklist', updatedChecklist);
    },
    [selectedReport, handleUpdateField]
  );

  const handleLinkNote = useCallback(
    (noteId: string) => {
      if (!selectedReport) return;
      const linkedNoteIds = selectedReport.linkedNoteIds.includes(noteId)
        ? selectedReport.linkedNoteIds.filter((id) => id !== noteId)
        : [...selectedReport.linkedNoteIds, noteId];
      handleUpdateField('linkedNoteIds', linkedNoteIds);
    },
    [selectedReport, handleUpdateField]
  );

  const handleExport = useCallback(() => {
    if (!selectedReport) return;
    const linkedNotes = notes.filter((n) =>
      selectedReport.linkedNoteIds.includes(n.id)
    );
    const markdown = exportToMarkdown(
      selectedReport,
      linkedNotes,
      activeTarget?.domain
    );
    const filename = generateExportFilename(selectedReport);

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedReport, notes, activeTarget]);

  const handleExportPython = useCallback(() => {
    if (!selectedReport) return;
    const linkedNotes = notes.filter((n) =>
      selectedReport.linkedNoteIds.includes(n.id)
    );
    const pythonFormat = exportToPythonFormat(
      selectedReport,
      linkedNotes,
      activeTarget?.domain
    );
    const filename = generatePythonExportFilename(selectedReport);

    const blob = new Blob([pythonFormat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedReport, notes, activeTarget]);

  const handleDelete = useCallback(() => {
    if (!selectedReport) return;
    if (confirm('Are you sure you want to delete this report?')) {
      onDeleteReport(selectedReport.id);
      setSelectedReport(null);
    }
  }, [selectedReport, onDeleteReport]);

  // Get notes for active target
  const targetNotes = notes.filter(
    (n) => !activeTarget || n.targetId === activeTarget.id
  );

  return (
    <div className="flex h-full gap-4">
      {/* Reports List */}
      <div className="w-80 flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Vulnerability Reports</h3>
            <button
              onClick={handleCreateReport}
              disabled={!activeTarget}
              className="btn btn-primary py-1.5 px-3 text-sm"
              title={activeTarget ? 'Create new report' : 'Select a target first'}
            >
              <IconPlus size={14} />
              New
            </button>
          </div>
          <div className="relative">
            <IconSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* Severity Filter */}
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--navy-800)]">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'critical', 'high', 'medium', 'low', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`text-xs py-1 px-2 rounded whitespace-nowrap ${
                  filterSeverity === sev
                    ? 'bg-[var(--navy-600)] text-[var(--foreground)]'
                    : 'text-[var(--foreground-dim)] hover:bg-[var(--navy-700)]'
                }`}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-2">
          {!activeTarget ? (
            <div className="text-center py-8 text-[var(--foreground-dim)]">
              <p className="text-sm">Select a target to view reports</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-[var(--foreground-dim)]">
              <p className="text-sm">No reports found</p>
              <button
                onClick={handleCreateReport}
                className="text-sm text-[var(--cyan-glow)] hover:underline mt-2"
              >
                Create your first report
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredReports.map((report) => {
                const progress = getChecklistProgress(report.checklist);
                const ready = isReportReady(report);
                const sevDef = SEVERITY_DEFINITIONS[report.severity];

                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedReport?.id === report.id
                        ? 'bg-[var(--navy-700)] border-l-2 border-[var(--cyan-glow)]'
                        : 'hover:bg-[var(--navy-800)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">
                        {report.title || 'Untitled Report'}
                      </span>
                      <span className={`badge badge-${sevDef.color} text-[10px] py-0`}>
                        {sevDef.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--foreground-dim)]">
                      <span>{report.vulnerabilityType || 'No type'}</span>
                      <div className="flex items-center gap-2">
                        {ready && (
                          <IconCheck size={12} className="text-[var(--green-glow)]" />
                        )}
                        <span>{progress}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-[var(--navy-600)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          progress === 100
                            ? 'bg-[var(--green-glow)]'
                            : 'bg-[var(--cyan-glow)]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Editor */}
      <div className="flex-1 flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {selectedReport ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`badge badge-${
                    SEVERITY_DEFINITIONS[selectedReport.severity].color
                  }`}
                >
                  {SEVERITY_DEFINITIONS[selectedReport.severity].label}
                </span>
                <span
                  className={`badge ${
                    selectedReport.status === 'ready'
                      ? 'badge-green'
                      : selectedReport.status === 'submitted'
                      ? 'badge-purple'
                      : 'badge-gray'
                  }`}
                >
                  {selectedReport.status.charAt(0).toUpperCase() +
                    selectedReport.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="btn btn-ghost py-1.5 px-3 text-sm"
                  title="Export to Markdown"
                >
                  <IconDownload size={14} />
                  Export MD
                </button>
                <button
                  onClick={handleExportPython}
                  className="btn btn-ghost py-1.5 px-3 text-sm"
                  title="Export for Python script (notes.txt)"
                >
                  <IconDownload size={14} />
                  Export Python
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost py-1.5 px-3 text-sm text-[var(--red-glow)]"
                  title="Delete report"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={selectedReport.title}
                  onChange={(e) => handleUpdateField('title', e.target.value)}
                  placeholder="e.g., Stored XSS in User Profile Bio"
                  className="input w-full"
                />
              </div>

              {/* Type and Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vulnerability Type
                  </label>
                  <select
                    value={selectedReport.vulnerabilityType}
                    onChange={(e) =>
                      handleUpdateField('vulnerabilityType', e.target.value)
                    }
                    className="input w-full"
                  >
                    <option value="">Select type...</option>
                    {VULNERABILITY_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Severity</label>
                  <select
                    value={selectedReport.severity}
                    onChange={(e) =>
                      handleUpdateField('severity', e.target.value)
                    }
                    className="input w-full"
                  >
                    {Object.entries(SEVERITY_DEFINITIONS).map(([key, def]) => (
                      <option key={key} value={key}>
                        {def.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={selectedReport.description}
                  onChange={(e) => handleUpdateField('description', e.target.value)}
                  placeholder="Describe the vulnerability in detail..."
                  className="input w-full h-32 resize-none"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  value={selectedReport.stepsToReproduce}
                  onChange={(e) =>
                    handleUpdateField('stepsToReproduce', e.target.value)
                  }
                  placeholder="1. Navigate to...&#10;2. Click on...&#10;3. Observe..."
                  className="input w-full h-32 resize-none font-mono text-sm"
                />
              </div>

              {/* Impact */}
              <div>
                <label className="block text-sm font-medium mb-2">Impact</label>
                <textarea
                  value={selectedReport.impact}
                  onChange={(e) => handleUpdateField('impact', e.target.value)}
                  placeholder="Describe what an attacker could achieve..."
                  className="input w-full h-24 resize-none"
                />
              </div>

              {/* Remediation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Remediation Suggestion{' '}
                  <span className="text-[var(--foreground-dim)]">(optional)</span>
                </label>
                <textarea
                  value={selectedReport.remediation || ''}
                  onChange={(e) => handleUpdateField('remediation', e.target.value)}
                  placeholder="Suggested fix or mitigation..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">
                    Bug Bounty Reporting Checklist
                  </label>
                  <span className="text-xs text-[var(--foreground-dim)]">
                    {getChecklistProgress(selectedReport.checklist)}% complete
                  </span>
                </div>
                <div className="space-y-2">
                  {CHECKLIST_CATEGORIES.map((cat) => {
                    const categoryItems = selectedReport.checklist.filter(
                      (item) => item.category === cat.id
                    );
                    if (categoryItems.length === 0) return null;

                    const completedCount = categoryItems.filter((i) => i.completed).length;

                    return (
                      <div
                        key={cat.id}
                        className="p-3 rounded-lg bg-[var(--navy-800)] border border-[var(--border)]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-[var(--foreground-dim)] uppercase tracking-wide">
                            {cat.label}
                          </div>
                          <span className="text-[10px] text-[var(--foreground-dim)]">
                            {completedCount}/{categoryItems.length}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {categoryItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleToggleChecklistItem(item.id)}
                              className="w-full flex items-center gap-3 p-2 rounded hover:bg-[var(--navy-700)] transition-colors text-left"
                            >
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                  item.completed
                                    ? 'bg-[var(--green-glow)] border-[var(--green-glow)]'
                                    : 'border-[var(--navy-500)]'
                                }`}
                              >
                                {item.completed && (
                                  <IconCheck size={12} className="text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm ${
                                      item.completed
                                        ? 'text-[var(--foreground-dim)] line-through'
                                        : ''
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                  {item.required && !item.completed && (
                                    <span className="text-[10px] text-[var(--red-glow)] shrink-0">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[var(--foreground-dim)] truncate">
                                  {item.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Linked Notes */}
              {targetNotes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Link Notes as Evidence
                  </label>
                  <div className="space-y-1">
                    {targetNotes.map((note) => {
                      const isLinked = selectedReport.linkedNoteIds.includes(
                        note.id
                      );
                      return (
                        <button
                          key={note.id}
                          onClick={() => handleLinkNote(note.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isLinked
                              ? 'bg-[var(--cyan-glow)]/10 border-[var(--cyan-glow)]'
                              : 'bg-[var(--navy-800)] border-[var(--border)] hover:border-[var(--cyan-glow)]'
                          }`}
                        >
                          <div className="text-left">
                            <div className="text-sm font-medium">{note.title}</div>
                            <div className="text-xs text-[var(--foreground-dim)] line-clamp-1">
                              {note.content.substring(0, 100)}
                            </div>
                          </div>
                          {isLinked && (
                            <IconCheck
                              size={16}
                              className="text-[var(--cyan-glow)]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateField('status', 'draft')}
                    className={`btn ${
                      selectedReport.status === 'draft'
                        ? 'btn-primary'
                        : 'btn-ghost'
                    } py-2 px-4`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleUpdateField('status', 'ready')}
                    disabled={!isReportReady(selectedReport)}
                    className={`btn ${
                      selectedReport.status === 'ready'
                        ? 'btn-primary'
                        : 'btn-ghost'
                    } py-2 px-4`}
                    title={
                      isReportReady(selectedReport)
                        ? 'Mark as ready'
                        : 'Complete all required items first'
                    }
                  >
                    Ready
                  </button>
                  <button
                    onClick={() => handleUpdateField('status', 'submitted')}
                    className={`btn ${
                      selectedReport.status === 'submitted'
                        ? 'btn-primary'
                        : 'btn-ghost'
                    } py-2 px-4`}
                  >
                    Submitted
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--foreground-dim)]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--navy-800)] flex items-center justify-center">
                <IconChevronRight size={32} className="text-[var(--navy-500)]" />
              </div>
              <p className="text-lg font-medium">Select a report</p>
              <p className="text-sm mt-1">
                Choose a report from the list or create a new one
              </p>
              {!activeTarget && (
                <p className="text-xs mt-3 text-[var(--amber-warning)]">
                  Tip: Set an active target to create reports
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
