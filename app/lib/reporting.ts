import {
  VulnerabilityReport,
  ReportChecklistItem,
  Note,
  VulnerabilitySeverity,
} from '@/app/types';

// Default checklist items for vulnerability reporting
// Based on real-world HackerOne/Intigriti/Bugcrowd best practices
export const DEFAULT_CHECKLIST: Omit<ReportChecklistItem, 'id' | 'completed'>[] = [
  // 1. PRE-SUBMISSION - Verify before starting report
  {
    label: 'Target is in scope',
    description: 'Domain, app, API, version verified against program policy',
    required: true,
    category: 'pre-submission',
  },
  {
    label: 'Vulnerability type allowed',
    description: 'Check program policy for excluded vulnerability types',
    required: true,
    category: 'pre-submission',
  },
  {
    label: 'Safe harbor rules followed',
    description: 'No unauthorized access, no real user data accessed',
    required: true,
    category: 'pre-submission',
  },
  {
    label: 'Duplicate check done',
    description: 'Searched disclosed reports for similar vulnerabilities',
    required: false,
    category: 'pre-submission',
  },

  // 2. VALIDATION - Confirm the bug
  {
    label: 'Bug is reproducible',
    description: 'Works 100% consistently, not a fluke',
    required: true,
    category: 'validation',
  },
  {
    label: 'Clean environment test',
    description: 'Verified in fresh browser/incognito/new account',
    required: true,
    category: 'validation',
  },
  {
    label: 'Impact confirmed',
    description: 'CIA triad impact verified (Confidentiality, Integrity, Availability)',
    required: true,
    category: 'validation',
  },

  // 3. EVIDENCE - Collect proof
  {
    label: 'Proof of Concept ready',
    description: 'Minimal steps, clear payloads, no fluff',
    required: true,
    category: 'evidence',
  },
  {
    label: 'Screenshots/Video captured',
    description: 'Shows URL, account role, and result clearly',
    required: false,
    category: 'evidence',
  },
  {
    label: 'Request/Response logged',
    description: 'HTTP method, endpoint, headers, body, response (via Burp/curl)',
    required: true,
    category: 'evidence',
  },

  // 4. REPORT WRITING - Craft the submission
  {
    label: 'Title is clear and impactful',
    description: 'Short, precise, includes impact (e.g., "IDOR allows viewing other users invoices")',
    required: true,
    category: 'writing',
  },
  {
    label: 'Summary written (2-4 sentences)',
    description: 'What the bug is, who is affected, why it matters',
    required: true,
    category: 'writing',
  },
  {
    label: 'Steps to Reproduce numbered',
    description: 'Copy-paste friendly, assume triager is busy',
    required: true,
    category: 'writing',
  },
  {
    label: 'Impact section complete',
    description: 'Real-world consequence, business risk, what attacker could do at scale',
    required: true,
    category: 'writing',
  },
  {
    label: 'Suggested fix added',
    description: 'Authorization check, input sanitization, rate limiting, etc.',
    required: false,
    category: 'writing',
  },

  // 5. SUBMISSION HYGIENE - Polish before submit
  {
    label: 'Tone is professional',
    description: 'Polite, neutral, no threats or bragging',
    required: true,
    category: 'hygiene',
  },
  {
    label: 'Tokens/passwords redacted',
    description: 'Use REDACTED_TOKEN placeholders for sensitive data',
    required: true,
    category: 'hygiene',
  },

  // 6. FINAL CHECKS - Golden rules
  {
    label: 'Can reproduce in 5 minutes?',
    description: 'Steps are clear enough for quick verification',
    required: true,
    category: 'final',
  },
  {
    label: 'Impact obvious to non-security person?',
    description: 'Business risk explained without jargon',
    required: true,
    category: 'final',
  },
];

// Checklist category display names and order
export const CHECKLIST_CATEGORIES = [
  { id: 'pre-submission', label: 'Pre-Submission', description: 'Verify before starting' },
  { id: 'validation', label: 'Validation', description: 'Confirm the bug' },
  { id: 'evidence', label: 'Evidence', description: 'Collect proof' },
  { id: 'writing', label: 'Report Writing', description: 'Craft the submission' },
  { id: 'hygiene', label: 'Submission Hygiene', description: 'Polish before submit' },
  { id: 'final', label: 'Final Checks', description: 'Golden rules' },
] as const;

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

// Export report to Python script input format (notes.txt)
// This format is consumed by report_generator.py
export function exportToPythonFormat(
  report: VulnerabilityReport,
  linkedNotes: Note[] = [],
  targetDomain?: string
): string {
  const vulnType = VULNERABILITY_TYPES.find((v) => v.id === report.vulnerabilityType);
  const lines: string[] = [];

  // Title line
  lines.push(report.title || 'Untitled Report');

  // Vulnerability type
  lines.push(vulnType?.label || report.vulnerabilityType || 'Unknown');

  // Target domain
  lines.push(targetDomain || 'N/A');

  // Severity
  lines.push(SEVERITY_DEFINITIONS[report.severity].label);

  // Description
  lines.push('---DESCRIPTION---');
  lines.push(report.description || 'No description provided');

  // Steps to reproduce
  lines.push('---STEPS---');
  lines.push(report.stepsToReproduce || 'No steps provided');

  // Impact
  lines.push('---IMPACT---');
  lines.push(report.impact || 'No impact assessment provided');

  // Remediation
  if (report.remediation) {
    lines.push('---REMEDIATION---');
    lines.push(report.remediation);
  }

  // Linked notes as evidence
  if (linkedNotes.length > 0) {
    lines.push('---EVIDENCE---');
    linkedNotes.forEach((note) => {
      lines.push(`[${note.title}]`);
      lines.push(note.content);
      lines.push('');
    });
  }

  return lines.join('\n');
}

// Generate filename for Python format export
export function generatePythonExportFilename(report: VulnerabilityReport): string {
  const date = new Date().toISOString().slice(0, 10);
  const title = report.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30);
  return `notes-${title || 'untitled'}-${date}.txt`;
}
