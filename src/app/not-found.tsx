import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-xl font-semibold text-ink">Page not found</h2>
      <p className="text-sm text-ink-2">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild>
        <Link href="/notes">Go to Notes</Link>
      </Button>
    </div>
  );
}
