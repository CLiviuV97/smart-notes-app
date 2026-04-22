function SkeletonNoteCard() {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="mt-3 h-3 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

function SkeletonNoteCardList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonNoteCard key={i} />
      ))}
    </>
  );
}

export { SkeletonNoteCard, SkeletonNoteCardList };
