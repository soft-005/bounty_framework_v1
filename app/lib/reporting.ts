import {
  VulnerabilityReport,
  ReportChecklistItem,
  Note,
  VulnerabilitySeverity,
} from '@/app/types';

// Default checklist items for vulnerability reporting
export const DEFAULT_CHECKLIST: Omit<ReportChecklistItem, 'id' | 'completed'>[] = [
  // Basic information
  {
    label: 'Title/Summary',
    description: 'Clear, concise title describing the vulnerability',
    required: true,
    category: 'basic',
  },
  {
    label: 'Vulnerability Type',
    description: 'Classification (XSS, SQLi, IDOR, etc.)',
    required: true,
    category: 'basic',
  },
  {
    label: 'Severity Assessment',
    description: 'Impact level with CVSS or custom rating',
    required: true,
    category: 'basic',
  },
  // Technical details
  {
    label: 'Affected Endpoint/Component',
    description: 'Specific URL, parameter, or component affected',
    required: true,
    category: 'technical',
  },
  {
    label: 'Steps to Reproduce',
    description: 'Clear, numbered steps to replicate the issue',
    required: true,
    category: 'technical',
  },
  {
    label: 'Request/Response Details',
    description: 'HTTP request/response showing the vulnerability',
    required: false,
    category: 'technical',
  },
  // Evidence
  {
    label: 'Proof of Concept',
    description: 'Working PoC code or payload',
    required: true,
    category: 'evidence',
  },
  {
    label: 'Screenshots/Video',
    description: 'Visual evidence of the vulnerability',
    required: false,
    category: 'evidence',
  },
  // Impact
  {
    label: 'Impact Description',
    description: 'What an attacker could achieve',
    required: true,
    category: 'impact',
  },
  {
    label: 'Business Impact',
    description: 'Potential damage to the organization',
    required: false,
    category: 'impact',
  },
  {
    label: 'Remediation Suggestion',
    description: 'Recommended fix or mitigation',
    required: false,
    category: 'impact',
  },
];

// Vulnerability types for selection
export const VULNERABILITY_TYPES = [
  { id: 'xss', label: 'Cross-Site Scripting (XSS)', category: 'Injection' },
  { id: 'sqli', label: 'SQL Injection', category: 'Injection' },
  { id: 'cmdi', label: 'Command Injection', category: 'Injection' },
  { id: 'ssti', label: 'Server-Side Template Injection', category: 'Injection' },
  { id: 'xxe', label: 'XML External Entity (XXE)', category: 'Injection' },
  { id: 'idor', label: 'Insecure Direct Object Reference', category: 'Access Control' },
  { id: 'bola', label: 'Broken Object Level Authorization', category: 'Access Control' },
  { id: 'privilege_escalation', label: 'Privilege Escalation', category: 'Access Control' },
  { id: 'authentication_bypass', label: 'Authentication Bypass', category: 'Authentication' },
  { id: 'session_fixation', label: 'Session Fixation', category: 'Authentication' },
  { id: 'weak_password', label: 'Weak Password Policy', category: 'Authentication' },
  { id: 'ssrf', label: 'Server-Side Request Forgery', category: 'SSRF' },
  { id: 'csrf', label: 'Cross-Site Request Forgery', category: 'CSRF' },
  { id: 'open_redirect', label: 'Open Redirect', category: 'Redirect' },
  { id: 'cors', label: 'CORS Misconfiguration', category: 'Misconfiguration' },
  { id: 'info_disclosure', label: 'Information Disclosure', category: 'Misconfiguration' },
  { id: 'rce', label: 'Remote Code Execution', category: 'Critical' },
  { id: 'lfi', label: 'Local File Inclusion', category: 'File Inclusion' },
  { id: 'rfi', label: 'Remote File Inclusion', category: 'File Inclusion' },
  { id: 'path_traversal', label: 'Path Traversal', category: 'File Inclusion' },
  { id: 'other', label: 'Other', category: 'Other' },
];

// Severity definitions
export const SEVERITY_DEFINITIONS: Record<
  VulnerabilitySeverity,
  { label: string; color: string; description: string }
> = {
  info: {
    label: 'Informational',
    color: 'gray',
    description: 'No direct security impact',
  },
  low: {
    label: 'Low',
    color: 'green',
    description: 'Minor security concern with limited impact',
  },
  medium: {
    label: 'Medium',
    color: 'amber',
    description: 'Moderate security risk requiring attention',
  },
  high: {
    label: 'High',
    color: 'orange',
    description: 'Significant security risk with serious impact',
  },
  critical: {
    label: 'Critical',
    color: 'red',
    description: 'Severe security risk requiring immediate action',
  },
};

// Create a new report with default values
export function createReport(targetId: string): VulnerabilityReport {
  const now = new Date().toISOString();
  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    targetId,
    title: '',
    severity: 'medium',
    vulnerabilityType: '',
    description: '',
    stepsToReproduce: '',
    impact: '',
    remediation: '',
    linkedNoteIds: [],
    checklist: DEFAULT_CHECKLIST.map((item, index) => ({
      ...item,
      id: `checklist_${index}`,
      completed: false,
    })),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

// Calculate checklist completion percentage
export function getChecklistProgress(checklist: ReportChecklistItem[]): number {
  const total = checklist.length;
  const completed = checklist.filter((item) => item.completed).length;
  return Math.round((completed / total) * 100);
}

// Check if all required items are complete
export function isReportReady(report: VulnerabilityReport): boolean {
  const requiredItems = report.checklist.filter((item) => item.required);
  return (
    requiredItems.every((item) => item.completed) &&
    report.title.trim() !== '' &&
    report.vulnerabilityType !== '' &&
    report.description.trim() !== '' &&
    report.stepsToReproduce.trim() !== '' &&
    report.impact.trim() !== ''
  );
}

// Export report to Markdown format
export function exportToMarkdown(
  report: VulnerabilityReport,
  linkedNotes: Note[] = [],
  targetDomain?: string
): string {
  const severityDef = SEVERITY_DEFINITIONS[report.severity];
  const vulnType = VULNERABILITY_TYPES.find((v) => v.id === report.vulnerabilityType);

  let md = `# ${report.title || 'Untitled Vulnerability Report'}\n\n`;

  // Metadata
  md += `## Summary\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Severity** | ${severityDef.label} |\n`;
  md += `| **Type** | ${vulnType?.label || report.vulnerabilityType} |\n`;
  if (targetDomain) {
    md += `| **Target** | ${targetDomain} |\n`;
  }
  md += `| **Status** | ${report.status.charAt(0).toUpperCase() + report.status.slice(1)} |\n`;
  md += `| **Created** | ${new Date(report.createdAt).toLocaleDateString()} |\n`;
  md += `\n`;

  // Description
  md += `## Description\n\n`;
  md += `${report.description || '_No description provided_'}\n\n`;

  // Steps to Reproduce
  md += `## Steps to Reproduce\n\n`;
  if (report.stepsToReproduce) {
    // Try to format as numbered list if not already
    const steps = report.stepsToReproduce
      .split('\n')
      .filter((line) => line.trim())
      .map((line, index) => {
        if (/^\d+\./.test(line.trim())) {
          return line;
        }
        return `${index + 1}. ${line.trim()}`;
      });
    md += steps.join('\n') + '\n\n';
  } else {
    md += `_No steps provided_\n\n`;
  }

  // Impact
  md += `## Impact\n\n`;
  md += `${report.impact || '_No impact assessment provided_'}\n\n`;

  // Remediation
  if (report.remediation) {
    md += `## Recommended Remediation\n\n`;
    md += `${report.remediation}\n\n`;
  }

  // Linked Notes / Evidence
  if (linkedNotes.length > 0) {
    md += `## Evidence & Notes\n\n`;
    linkedNotes.forEach((note, index) => {
      md += `### ${note.title || `Note ${index + 1}`}\n\n`;
      md += `${note.content}\n\n`;
      if (note.tags.length > 0) {
        md += `_Tags: ${note.tags.join(', ')}_\n\n`;
      }
    });
  }

  // Checklist progress
  const progress = getChecklistProgress(report.checklist);
  md += `---\n\n`;
  md += `_Checklist Progress: ${progress}%_\n\n`;

  // Completed items
  const completedItems = report.checklist.filter((item) => item.completed);
  if (completedItems.length > 0) {
    md += `**Completed:**\n`;
    completedItems.forEach((item) => {
      md += `- [x] ${item.label}\n`;
    });
  }

  // Pending items
  const pendingItems = report.checklist.filter((item) => !item.completed);
  if (pendingItems.length > 0) {
    md += `\n**Pending:**\n`;
    pendingItems.forEach((item) => {
      md += `- [ ] ${item.label}${item.required ? ' (Required)' : ''}\n`;
    });
  }

  return md;
}

// Generate filename for export
export function generateExportFilename(report: VulnerabilityReport): string {
  const date = new Date().toISOString().slice(0, 10);
  const title = report.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 50);
  return `report-${title || 'untitled'}-${date}.md`;
}
