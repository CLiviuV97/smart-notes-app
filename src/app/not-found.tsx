import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Page not found</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/notes"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Go to Notes
      </Link>
    </div>
  );
}
