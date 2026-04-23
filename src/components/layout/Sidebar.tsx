'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Plus, LogOut, FileUp } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  setSearchQuery,
  selectSearchQuery,
  selectSelectedNoteId,
  setSelectedNote,
} from '@/features/notes/store/notesUiSlice';
import { useInfiniteNotes } from '@/features/notes/hooks/useInfiniteNotes';
import { useCreateNoteMutation } from '@/features/notes/api/notesApi';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { logout } from '@/features/auth/services/authClient';
import { SkeletonNoteCardList } from '@/features/notes/components/SkeletonNoteCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ThemeToggle } from './ThemeToggle';
import { PdfImportModal } from '@/features/notes/components/PdfImportModal';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchQuery = useAppSelector(selectSearchQuery);
  const selectedNoteId = useAppSelector(selectSelectedNoteId);
  const { user } = useAuthSession();
  const { notes, sentinelRef, isFetching, hasMore } = useInfiniteNotes();
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : notes;

  const handleCreateNote = async () => {
    try {
      const note = await createNote({ title: 'Untitled', content: '' }).unwrap();
      dispatch(setSelectedNote(note.id));
      router.push(`/notes/${note.id}`);
      onClose?.();
    } catch {
      // handled by RTK Query
    }
  };

  const handleSelectNote = (noteId: string) => {
    dispatch(setSelectedNote(noteId));
    router.push(`/notes/${noteId}`);
    onClose?.();
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Brand area */}
      <div className="flex items-center gap-2.5 border-b border-rule px-4 py-3.5">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[3px] bg-ink">
          <span className="font-serif text-[13px] italic font-semibold leading-none text-paper">
            S
          </span>
        </div>
        <span className="font-serif text-[22px] italic font-semibold leading-none text-ink">
          Smart Notes
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-2 p-3">
        <div className="flex gap-2">
          <button
            onClick={handleCreateNote}
            disabled={isCreating}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[7px] bg-ink text-[13px] font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isCreating ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
            New note
          </button>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-rule-2 text-ink-2 transition-colors hover:bg-paper-2"
          >
            <FileUp className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="h-9 w-full rounded-[7px] border border-rule-2 bg-paper-2 pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Notes list */}
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
            <p className="mt-1 line-clamp-2 font-serif text-[13px] leading-[1.4] text-ink-2">
              {note.content.slice(0, 80)}
            </p>
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

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-rule px-3 py-2.5">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-margin-red text-[11px] font-semibold text-white">
            {initials}
          </div>
          <span className="truncate text-[12px] text-ink-2">{user?.email ?? 'User'}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <Button variant="ghost" size="sm" aria-label="Sign out" onClick={() => logout()}>
            <LogOut className="h-4 w-4 text-ink-3" />
          </Button>
        </div>
      </div>
      <PdfImportModal open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen} />
    </div>
  );
}
