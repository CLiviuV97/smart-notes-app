'use client';

import { useRouter } from 'next/navigation';
import { Search, Plus, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSearchQuery, selectSearchQuery, selectSelectedNoteId, setSelectedNote } from '@/features/notes/store/notesUiSlice';
import { useInfiniteNotes } from '@/features/notes/hooks/useInfiniteNotes';
import { useCreateNoteMutation } from '@/features/notes/api/notesApi';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { logout } from '@/features/auth/services/authClient';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { SkeletonNoteCardList } from '@/features/notes/components/SkeletonNoteCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ThemeToggle } from './ThemeToggle';

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

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      {/* Header */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-surface-foreground">Notes</h2>
          <Button size="sm" loading={isCreating} onClick={handleCreateNote}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isFetching && notes.length === 0 && (
          <div className="space-y-2 px-2">
            <SkeletonNoteCardList count={5} />
          </div>
        )}

        {!isFetching && notes.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notes yet
          </p>
        )}

        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => handleSelectNote(note.id)}
            className={`mb-1 w-full rounded-md px-3 py-2 text-left transition-colors ${
              selectedNoteId === note.id
                ? 'bg-primary/10 text-primary'
                : 'text-surface-foreground hover:bg-muted'
            }`}
          >
            <p className="truncate text-sm font-medium">{note.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {note.content.slice(0, 60)}
            </p>
          </button>
        ))}

        <div ref={sentinelRef} />

        {isFetching && notes.length > 0 && (
          <div className="flex justify-center py-3">
            <Spinner size="sm" />
          </div>
        )}

        {!hasMore && notes.length > 0 && (
          <p className="py-2 text-center text-xs text-muted-foreground">
            All notes loaded
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border p-3">
        <div className="flex items-center gap-2 truncate">
          <span className="truncate text-xs text-muted-foreground">
            {user?.email ?? 'User'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" aria-label="Sign out" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
