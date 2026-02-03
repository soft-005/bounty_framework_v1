import { NextRequest, NextResponse } from 'next/server';
import {
  startExecution,
  cancelExecution,
  getJobStatus,
  validateCommand,
  generateJobId,
  getRunningJobs,
} from '@/app/lib/execution';

const MAX_CONCURRENT_JOBS = 5;

// POST - Start new execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, toolId, jobId: providedJobId, useDocker = false } = body;

    if (!command) {
      return NextResponse.json(
        { success: false, error: 'Command is required' },
        { status: 400 }
      );
    }

    // Validate command
    const validation = validateCommand(command);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check concurrent job limit
    const runningJobs = getRunningJobs();
    if (runningJobs.length >= MAX_CONCURRENT_JOBS) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum concurrent jobs (${MAX_CONCURRENT_JOBS}) reached. Please wait for a job to complete.`,
          queuePosition: runningJobs.length - MAX_CONCURRENT_JOBS + 1,
        },
        { status: 429 }
      );
    }

    // Generate or use provided job ID
    const jobId = providedJobId || generateJobId();

    // Start execution
    const result = startExecution(jobId, command, useDocker);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      toolId,
      command,
      message: 'Execution started',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// GET - Get job status or list running jobs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    // Get specific job status
    const status = getJobStatus(jobId);
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, job: status });
  }

  // List all running jobs
  const runningJobs = getRunningJobs();
  const jobs = runningJobs.map((id) => getJobStatus(id)).filter(Boolean);

  return NextResponse.json({
    success: true,
    jobs,
    count: jobs.length,
    maxConcurrent: MAX_CONCURRENT_JOBS,
  });
}

// DELETE - Cancel execution
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Job ID is required' },
      { status: 400 }
    );
  }

  const cancelled = cancelExecution(jobId);

  if (!cancelled) {
    return NextResponse.json(
      { success: false, error: 'Job not found or already completed' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    jobId,
    message: 'Execution cancelled',
  });
}
