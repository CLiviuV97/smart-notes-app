'use client';

import { useEffect, useRef } from 'react';

const BATCH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 10;

interface ErrorReport {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
}

export function useErrorReporter() {
  const queueRef = useRef<ErrorReport[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function flush() {
      if (queueRef.current.length === 0) return;
      const batch = queueRef.current.splice(0, MAX_BATCH_SIZE);
      for (const report of batch) {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        })
          .then((res) => {
            if (!res.ok) {
              console.error('[useErrorReporter] /api/log-error responded', res.status, report);
            }
          })
          .catch((networkErr) => {
            console.error('[useErrorReporter] Failed to send error report:', networkErr, report);
          });
      }
    }

    function enqueue(report: ErrorReport) {
      if (queueRef.current.length < MAX_BATCH_SIZE * 3) {
        queueRef.current.push(report);
      }
    }

    function handleError(event: ErrorEvent) {
      enqueue({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        url: event.filename ?? window.location.href,
        userAgent: navigator.userAgent,
      });
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      enqueue({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    timerRef.current = setInterval(flush, BATCH_INTERVAL_MS);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      if (timerRef.current) clearInterval(timerRef.current);
      flush(); // Send remaining on unmount
    };
  }, []);
}
