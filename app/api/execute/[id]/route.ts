import { NextRequest } from 'next/server';
import { getJobStatus, getJobOutput, isJobRunning } from '@/app/lib/execution';

// GET - Stream execution output via Server-Sent Events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

  // Check if job exists
  const initialStatus = getJobStatus(jobId);
  if (!initialStatus) {
    return new Response(
      JSON.stringify({ error: 'Job not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let lastOutputLength = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial status
      const initialEvent = `event: status\ndata: ${JSON.stringify({
        type: 'status',
        status: initialStatus.status,
        jobId,
      })}\n\n`;
      controller.enqueue(encoder.encode(initialEvent));

      // Send any existing output
      const existingOutput = getJobOutput(jobId);
      if (existingOutput.length > 0) {
        for (const line of existingOutput) {
          const outputEvent = `event: output\ndata: ${JSON.stringify({
            type: 'output',
            line,
          })}\n\n`;
          controller.enqueue(encoder.encode(outputEvent));
        }
        lastOutputLength = existingOutput.length;
      }

      // If already completed, send completion and close
      if (!isJobRunning(jobId)) {
        const status = getJobStatus(jobId);
        const completeEvent = `event: complete\ndata: ${JSON.stringify({
          type: 'complete',
          exitCode: status?.exitCode ?? -1,
          status: status?.status,
          duration: status?.endTime && status?.startTime
            ? new Date(status.endTime).getTime() - new Date(status.startTime).getTime()
            : 0,
        })}\n\n`;
        controller.enqueue(encoder.encode(completeEvent));
        controller.close();
        return;
      }

      // Poll for updates
      intervalId = setInterval(() => {
        const output = getJobOutput(jobId);
        const running = isJobRunning(jobId);

        // Send new output lines
        if (output.length > lastOutputLength) {
          for (let i = lastOutputLength; i < output.length; i++) {
            const outputEvent = `event: output\ndata: ${JSON.stringify({
              type: 'output',
              line: output[i],
            })}\n\n`;
            controller.enqueue(encoder.encode(outputEvent));
          }
          lastOutputLength = output.length;
        }

        // Check if job completed
        if (!running) {
          const status = getJobStatus(jobId);
          const completeEvent = `event: complete\ndata: ${JSON.stringify({
            type: 'complete',
            exitCode: status?.exitCode ?? -1,
            status: status?.status,
            duration: status?.endTime && status?.startTime
              ? new Date(status.endTime).getTime() - new Date(status.startTime).getTime()
              : 0,
          })}\n\n`;
          controller.enqueue(encoder.encode(completeEvent));

          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          controller.close();
        }
      }, 100); // Poll every 100ms
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
