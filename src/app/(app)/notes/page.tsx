'use client';

import { useInfiniteNotes } from '@/features/notes/hooks/useInfiniteNotes';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { SkeletonNoteCardList } from '@/features/notes/components/SkeletonNoteCard';
import { EmptyState } from '@/features/notes/components/EmptyState';

export default function NotesPage() {
  const { notes, sentinelRef, isFetching, hasMore } = useInfiniteNotes();

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        My Notes
      </h1>

      {isFetching && notes.length === 0 && <SkeletonNoteCardList count={5} />}

      {!isFetching && notes.length === 0 && <EmptyState />}

      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}

      <div ref={sentinelRef} />

      {isFetching && notes.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
        </div>
      )}

      {!hasMore && notes.length > 0 && (
        <p className="py-4 text-center text-sm text-zinc-400">
          All notes loaded
        </p>
      )}
    </div>
  );
}
