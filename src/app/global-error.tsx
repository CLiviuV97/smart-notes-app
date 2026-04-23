'use client';

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4">
          <h2 className="text-xl font-semibold text-zinc-900">Something went wrong</h2>
          <p className="text-sm text-zinc-600">A critical error occurred. Please try again.</p>
          <button
            onClick={() => unstable_retry()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
