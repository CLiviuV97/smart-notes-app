'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-xl font-semibold text-ink">Something went wrong</h2>
      <p className="text-sm text-ink-2">An unexpected error occurred. Please try again.</p>
      <Button onClick={() => unstable_retry()}>Try again</Button>
    </div>
  );
}
