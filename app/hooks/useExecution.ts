'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ExecutionJob, Tool } from '@/app/types';

// Generate unique ID
function generateId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// State type
interface ExecutionState {
  jobs: Map<string, ExecutionJob>;
  queue: string[];
  running: Set<string>;
}

// Actions
type ExecutionAction =
  | { type: 'QUEUE_JOB'; job: ExecutionJob }
  | { type: 'START_JOB'; jobId: string }
  | { type: 'UPDATE_OUTPUT'; jobId: string; line: string }
  | { type: 'COMPLETE_JOB'; jobId: string; exitCode: number; status: 'completed' | 'failed' | 'cancelled' }
  | { type: 'CANCEL_JOB'; jobId: string }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'CLEAR_JOB'; jobId: string };

// Reducer
function executionReducer(state: ExecutionState, action: ExecutionAction): ExecutionState {
  switch (action.type) {
    case 'QUEUE_JOB': {
      const newJobs = new Map(state.jobs);
      newJobs.set(action.job.id, action.job);
      return {
        ...state,
        jobs: newJobs,
        queue: [...state.queue, action.job.id],
      };
    }

    case 'START_JOB': {
      const job = state.jobs.get(action.jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      newJobs.set(action.jobId, { ...job, status: 'running' });

      const newRunning = new Set(state.running);
      newRunning.add(action.jobId);

      return {
        ...state,
        jobs: newJobs,
        queue: state.queue.filter((id) => id !== action.jobId),
        running: newRunning,
      };
    }

    case 'UPDATE_OUTPUT': {
      const job = state.jobs.get(action.jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      newJobs.set(action.jobId, {
        ...job,
        output: [...job.output, action.line],
      });

      return { ...state, jobs: newJobs };
    }

    case 'COMPLETE_JOB': {
      const job = state.jobs.get(action.jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      newJobs.set(action.jobId, {
        ...job,
        status: action.status,
        exitCode: action.exitCode,
        endTime: new Date().toISOString(),
      });

      const newRunning = new Set(state.running);
      newRunning.delete(action.jobId);

      return {
        ...state,
        jobs: newJobs,
        running: newRunning,
      };
    }

    case 'CANCEL_JOB': {
      const job = state.jobs.get(action.jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      newJobs.set(action.jobId, {
        ...job,
        status: 'cancelled',
        endTime: new Date().toISOString(),
      });

      const newRunning = new Set(state.running);
      newRunning.delete(action.jobId);

      return {
        ...state,
        jobs: newJobs,
        queue: state.queue.filter((id) => id !== action.jobId),
        running: newRunning,
      };
    }

    case 'CLEAR_COMPLETED': {
      const newJobs = new Map<string, ExecutionJob>();
      state.jobs.forEach((job, id) => {
        if (state.running.has(id) || state.queue.includes(id)) {
          newJobs.set(id, job);
        }
      });

      return { ...state, jobs: newJobs };
    }

    case 'CLEAR_JOB': {
      const newJobs = new Map(state.jobs);
      newJobs.delete(action.jobId);

      return {
        ...state,
        jobs: newJobs,
        queue: state.queue.filter((id) => id !== action.jobId),
      };
    }

    default:
      return state;
  }
}

// Initial state
const initialState: ExecutionState = {
  jobs: new Map(),
  queue: [],
  running: new Set(),
};

export function useExecution(maxConcurrent: number = 5) {
  const [state, dispatch] = useReducer(executionReducer, initialState);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const processedJobsRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const stateRef = useRef(state);

  // Keep stateRef in sync with state
  stateRef.current = state;

  // Process queue when running jobs change
  useEffect(() => {
    const processQueue = async () => {
      // Get current state from ref to avoid stale closures
      const currentState = stateRef.current;

      // Get jobs from queue that can start
      const availableSlots = maxConcurrent - currentState.running.size;
      const jobsToStart = currentState.queue
        .filter(id => !processedJobsRef.current.has(id))
        .slice(0, availableSlots);

      for (const jobId of jobsToStart) {
        // Mark as processed immediately to prevent duplicate processing
        processedJobsRef.current.add(jobId);

        const job = currentState.jobs.get(jobId);
        if (!job) continue;

        try {
          // Call API to start execution
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              command: job.command,
              toolId: job.toolId,
              jobId: job.id,
            }),
          });

          if (response.ok) {
            dispatch({ type: 'START_JOB', jobId });

            // Connect to SSE stream
            const es = new EventSource(`/api/execute/${jobId}`);

            // Add timeout to prevent hanging connections (5 minutes)
            const timeoutId = setTimeout(() => {
              if (eventSourcesRef.current.has(jobId)) {
                es.close();
                eventSourcesRef.current.delete(jobId);
                timeoutsRef.current.delete(jobId);
                dispatch({
                  type: 'COMPLETE_JOB',
                  jobId,
                  exitCode: -1,
                  status: 'failed',
                });
              }
            }, 300000);
            timeoutsRef.current.set(jobId, timeoutId);

            es.addEventListener('output', (event) => {
              const data = JSON.parse(event.data);
              dispatch({ type: 'UPDATE_OUTPUT', jobId, line: data.line });
            });

            es.addEventListener('complete', (event) => {
              const data = JSON.parse(event.data);
              // Clear timeout
              const timeout = timeoutsRef.current.get(jobId);
              if (timeout) {
                clearTimeout(timeout);
                timeoutsRef.current.delete(jobId);
              }
              dispatch({
                type: 'COMPLETE_JOB',
                jobId,
                exitCode: data.exitCode,
                status: data.status || (data.exitCode === 0 ? 'completed' : 'failed'),
              });
              es.close();
              eventSourcesRef.current.delete(jobId);
            });

            es.addEventListener('error', () => {
              // Clear timeout
              const timeout = timeoutsRef.current.get(jobId);
              if (timeout) {
                clearTimeout(timeout);
                timeoutsRef.current.delete(jobId);
              }
              dispatch({
                type: 'COMPLETE_JOB',
                jobId,
                exitCode: -1,
                status: 'failed',
              });
              es.close();
              eventSourcesRef.current.delete(jobId);
            });

            eventSourcesRef.current.set(jobId, es);
          } else {
            const error = await response.json();
            dispatch({
              type: 'UPDATE_OUTPUT',
              jobId,
              line: `[error] ${error.error || 'Failed to start execution'}`,
            });
            dispatch({
              type: 'COMPLETE_JOB',
              jobId,
              exitCode: -1,
              status: 'failed',
            });
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          dispatch({ type: 'UPDATE_OUTPUT', jobId, line: `[error] ${errorMsg}` });
          dispatch({
            type: 'COMPLETE_JOB',
            jobId,
            exitCode: -1,
            status: 'failed',
          });
        }
      }
    };

    if (state.queue.length > 0 && state.running.size < maxConcurrent) {
      processQueue();
    }
  }, [state.queue.length, state.running.size, maxConcurrent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
      processedJobsRef.current.clear();
    };
  }, []);

  // Start execution
  const startExecution = useCallback(
    (command: string, tool: Tool, targetId?: string): ExecutionJob => {
      const job: ExecutionJob = {
        id: generateId(),
        toolId: tool.id,
        toolName: tool.name,
        command,
        status: 'queued',
        startTime: new Date().toISOString(),
        output: [],
        targetId,
      };

      dispatch({ type: 'QUEUE_JOB', job });
      return job;
    },
    []
  );

  // Cancel execution
  const cancelExecution = useCallback(async (jobId: string) => {
    // Close SSE connection
    const es = eventSourcesRef.current.get(jobId);
    if (es) {
      es.close();
      eventSourcesRef.current.delete(jobId);
    }

    // Clear timeout
    const timeout = timeoutsRef.current.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(jobId);
    }

    // Call API to cancel
    try {
      await fetch(`/api/execute?jobId=${jobId}`, { method: 'DELETE' });
    } catch {
      // Ignore errors, just update local state
    }

    dispatch({ type: 'CANCEL_JOB', jobId });
  }, []);

  // Cancel all running and queued jobs
  const cancelAllRunning = useCallback(async () => {
    const jobsToCancel = Array.from(state.jobs.values()).filter(
      (job) => job.status === 'running' || job.status === 'queued'
    );

    for (const job of jobsToCancel) {
      // Close SSE connection
      const es = eventSourcesRef.current.get(job.id);
      if (es) {
        es.close();
        eventSourcesRef.current.delete(job.id);
      }

      // Call API to cancel
      try {
        await fetch(`/api/execute?jobId=${job.id}`, { method: 'DELETE' });
      } catch {
        // Ignore errors
      }

      dispatch({ type: 'CANCEL_JOB', jobId: job.id });
    }
  }, [state.jobs]);

  // Clear completed jobs
  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  }, []);

  // Clear specific job
  const clearJob = useCallback((jobId: string) => {
    dispatch({ type: 'CLEAR_JOB', jobId });
  }, []);

  // Get job by ID
  const getJob = useCallback(
    (jobId: string): ExecutionJob | undefined => {
      return state.jobs.get(jobId);
    },
    [state.jobs]
  );

  // Get jobs for a specific tool
  const getJobsForTool = useCallback(
    (toolId: string): ExecutionJob[] => {
      return Array.from(state.jobs.values()).filter((job) => job.toolId === toolId);
    },
    [state.jobs]
  );

  // Get active job for a tool (most recent running or queued)
  const getActiveJobForTool = useCallback(
    (toolId: string): ExecutionJob | undefined => {
      const toolJobs = Array.from(state.jobs.values())
        .filter((job) => job.toolId === toolId)
        .filter((job) => job.status === 'running' || job.status === 'queued');

      return toolJobs[toolJobs.length - 1];
    },
    [state.jobs]
  );

  return {
    jobs: Array.from(state.jobs.values()),
    runningCount: state.running.size,
    queuedCount: state.queue.length,
    maxConcurrent,
    startExecution,
    cancelExecution,
    cancelAllRunning,
    clearCompleted,
    clearJob,
    getJob,
    getJobsForTool,
    getActiveJobForTool,
  };
}
