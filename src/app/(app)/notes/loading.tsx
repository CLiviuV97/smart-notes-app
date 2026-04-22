import { SkeletonNoteCardList } from '@/features/notes/components/SkeletonNoteCard';

export default function NotesLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <SkeletonNoteCardList count={5} />
    </div>
  );
}
