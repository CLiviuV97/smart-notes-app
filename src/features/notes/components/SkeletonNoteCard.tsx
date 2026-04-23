function SkeletonNoteCard() {
  return (
    <div className="border-b border-rule px-5 py-3.5">
      <div className="h-5 w-3/4 animate-pulse rounded bg-paper-3" />
      <div className="mt-2 space-y-1.5">
        <div className="h-4 w-full animate-pulse rounded bg-paper-3" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-paper-2" />
      </div>
      <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-paper-2" />
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
