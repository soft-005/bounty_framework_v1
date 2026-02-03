import { spawn, ChildProcess } from 'child_process';
import { ExecutionJob } from '@/app/types';

// Store for active execution processes
const activeProcesses = new Map<string, ChildProcess>();
const jobOutputBuffers = new Map<string, string[]>();
const jobStatuses = new Map<string, ExecutionJob>();

// List of allowed security tools for validation
const ALLOWED_TOOLS = [
  'amass', 'subfinder', 'assetfinder', 'dnsx', 'shuffledns',
  'httpx', 'nuclei', 'katana', 'ffuf', 'gau', 'gospider',
  'naabu', 'cloud_enum', 'cewl', 'subdomainizer', 'masscan',
  'metabigor', 'git', 'python', 'python3', 'pip', 'pip3',
  // Common utilities
  'curl', 'wget', 'dig', 'nslookup', 'whois', 'host',
  // Networking tools
  'nc', 'ncat', 'netcat',
];

// Validate command against allowed tools
export function validateCommand(command: string): { valid: boolean; error?: string } {
  const trimmed = command.trim();
  if (!trimmed) {
    return { valid: false, error: 'Command is empty' };
  }

  const parts = trimmed.split(/\s+/);
  const tool = parts[0].toLowerCase();

  // Check if tool is in allowed list
  if (!ALLOWED_TOOLS.includes(tool)) {
    return { valid: false, error: `Tool '${tool}' is not in the allowed list` };
  }

  // Basic shell injection prevention
  const dangerousPatterns = [
    /[;&|`$(){}]/,  // Shell metacharacters
    /\$\(/,          // Command substitution
    /`/,             // Backticks
    /\|\|/,          // OR operator
    /&&/,            // AND operator
    />/,             // Redirect (output)
    /</,             // Redirect (input)
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Command contains potentially dangerous characters' };
    }
  }

  return { valid: true };
}

// Sanitize command for safe execution
export function sanitizeCommand(command: string): string {
  // Remove potentially dangerous characters but keep the basic command structure
  return command
    .replace(/[;&|`$(){}><]/g, '')
    .trim();
}

// Generate unique job ID
export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Start command execution
export function startExecution(
  jobId: string,
  command: string,
  useDocker: boolean = false
): { success: boolean; error?: string } {
  const validation = validateCommand(command);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const sanitizedCommand = sanitizeCommand(command);
  const parts = sanitizedCommand.split(/\s+/);
  const tool = parts[0];
  const args = parts.slice(1);

  // Initialize job status
  const job: ExecutionJob = {
    id: jobId,
    toolId: tool,
    toolName: tool,
    command: sanitizedCommand,
    status: 'running',
    startTime: new Date().toISOString(),
    output: [],
  };
  jobStatuses.set(jobId, job);
  jobOutputBuffers.set(jobId, []);

  try {
    let proc: ChildProcess;

    if (useDocker) {
      // Execute in Docker container
      proc = spawn('docker', ['exec', 'ksa-tools', tool, ...args], {
        shell: false,
      });
    } else {
      // Execute directly on host
      proc = spawn(tool, args, {
        shell: true, // Use shell on Windows for better compatibility
      });
    }

    activeProcesses.set(jobId, proc);

    proc.stdout?.on('data', (data) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      const buffer = jobOutputBuffers.get(jobId) || [];
      buffer.push(...lines);
      jobOutputBuffers.set(jobId, buffer);

      const status = jobStatuses.get(jobId);
      if (status) {
        status.output = buffer;
        jobStatuses.set(jobId, status);
      }
    });

    proc.stderr?.on('data', (data) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      const buffer = jobOutputBuffers.get(jobId) || [];
      buffer.push(...lines.map((l: string) => `[stderr] ${l}`));
      jobOutputBuffers.set(jobId, buffer);

      const status = jobStatuses.get(jobId);
      if (status) {
        status.output = buffer;
        jobStatuses.set(jobId, status);
      }
    });

    proc.on('close', (code) => {
      const status = jobStatuses.get(jobId);
      if (status) {
        status.status = code === 0 ? 'completed' : 'failed';
        status.exitCode = code ?? -1;
        status.endTime = new Date().toISOString();
        jobStatuses.set(jobId, status);
      }
      activeProcesses.delete(jobId);
    });

    proc.on('error', (err) => {
      const buffer = jobOutputBuffers.get(jobId) || [];
      buffer.push(`[error] ${err.message}`);
      jobOutputBuffers.set(jobId, buffer);

      const status = jobStatuses.get(jobId);
      if (status) {
        status.status = 'failed';
        status.output = buffer;
        status.endTime = new Date().toISOString();
        jobStatuses.set(jobId, status);
      }
      activeProcesses.delete(jobId);
    });

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMsg };
  }
}

// Cancel execution
export function cancelExecution(jobId: string): boolean {
  const proc = activeProcesses.get(jobId);
  if (proc) {
    proc.kill('SIGTERM');
    const status = jobStatuses.get(jobId);
    if (status) {
      status.status = 'cancelled';
      status.endTime = new Date().toISOString();
      jobStatuses.set(jobId, status);
    }
    activeProcesses.delete(jobId);
    return true;
  }
  return false;
}

// Get job status
export function getJobStatus(jobId: string): ExecutionJob | null {
  return jobStatuses.get(jobId) || null;
}

// Get job output
export function getJobOutput(jobId: string): string[] {
  return jobOutputBuffers.get(jobId) || [];
}

// Check if job is running
export function isJobRunning(jobId: string): boolean {
  return activeProcesses.has(jobId);
}

// Get all running job IDs
export function getRunningJobs(): string[] {
  return Array.from(activeProcesses.keys());
}

// Clean up completed jobs older than specified minutes
export function cleanupOldJobs(olderThanMinutes: number = 60): void {
  const cutoff = Date.now() - olderThanMinutes * 60 * 1000;

  for (const [jobId, status] of jobStatuses.entries()) {
    if (status.endTime && new Date(status.endTime).getTime() < cutoff) {
      jobStatuses.delete(jobId);
      jobOutputBuffers.delete(jobId);
    }
  }
}
