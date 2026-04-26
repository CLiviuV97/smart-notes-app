'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectSearchQuery,
  selectSelectedNoteId,
  setSelectedNote,
} from '@/features/notes/store/notesUiSlice';
import { useInfiniteNotes } from '@/features/notes/hooks/useInfiniteNotes';
import { NotePreview } from '@/features/notes/components/NotePreview';
import { SkeletonNoteCardList } from '@/features/notes/components/SkeletonNoteCard';
import { Spinner } from '@/components/ui/Spinner';

interface SidebarNotesListProps {
  onClose?: () => void;
}

export function SidebarNotesList({ onClose }: SidebarNotesListProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchQuery = useAppSelector(selectSearchQuery);
  const selectedNoteId = useAppSelector(selectSelectedNoteId);
  const { notes, sentinelRef, isFetching, hasMore } = useInfiniteNotes();

  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : notes;

  const handleSelectNote = (noteId: string) => {
    dispatch(setSelectedNote(noteId));
    router.push(`/notes/${noteId}`);
    onClose?.();
  };

  return (
    <div className="flex-1 overflow-y-auto thin-scroll">
      {isFetching && notes.length === 0 && (
        <div className="space-y-2 px-4">
          <SkeletonNoteCardList count={5} />
        </div>
      )}

      {!isFetching && notes.length === 0 && (
        <p className="px-5 py-8 text-center font-serif text-[13px] italic text-ink-3">
          No notes yet
        </p>
      )}

      {!isFetching && notes.length > 0 && filteredNotes.length === 0 && (
        <p className="px-5 py-8 text-center font-serif text-[13px] italic text-ink-3">
          No matching notes
        </p>
      )}

      {filteredNotes.map((note) => (
        <button
          key={note.id}
          onClick={() => handleSelectNote(note.id)}
          className={`relative flex w-full flex-col border-b border-rule px-5 py-3.5 text-left transition-colors ${
            selectedNoteId === note.id ? 'bg-paper-3' : 'hover:bg-paper-2'
          }`}
        >
          {selectedNoteId === note.id && (
            <div className="absolute inset-y-0 left-0 w-[3px] bg-margin-red" />
          )}
          <p className="truncate font-serif text-[15px] font-medium leading-tight tracking-[-0.005em] text-ink">
            {note.title}
          </p>
          <NotePreview
            content={note.content}
            maxLength={80}
            className="mt-1 line-clamp-2 font-serif text-[13px] leading-[1.4] text-ink-2"
          />
          <div className="mt-2 flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-3">
            <span>
              {new Date(note.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </button>
      ))}

      <div ref={sentinelRef} />

      {isFetching && notes.length > 0 && (
        <div className="flex justify-center py-3">
          <Spinner size="sm" />
        </div>
      )}

      {!hasMore && notes.length > 0 && (
        <p className="py-2 text-center font-mono text-[10px] uppercase text-ink-4">
          All notes loaded
        </p>
      )}
    </div>
  );
}
