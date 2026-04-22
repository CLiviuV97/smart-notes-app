'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetNoteQuery, useUpdateNoteMutation } from '@/features/notes/api/notesApi';
import { useAppDispatch } from '@/store';
import { setEditorDirty } from '@/features/notes/store/notesUiSlice';
import { Spinner } from '@/components/ui/Spinner';

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const dispatch = useAppDispatch();
  const { data: note, isLoading } = useGetNoteQuery(noteId);
  const [updateNote] = useUpdateNoteMutation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedForRef = useRef<string | null>(null);

  // Sync from server — only on note switch or initial load
  useEffect(() => {
    if (note && initializedForRef.current !== noteId) {
      initializedForRef.current = noteId;
      setTitle(note.title);
      setContent(note.content);
      setSaveStatus('idle');
    }
  }, [note, noteId]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content]);

  const debouncedSave = useCallback(
    (patch: { title?: string; content?: string }) => {
      dispatch(setEditorDirty(true));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await updateNote({ id: noteId, ...patch }).unwrap();
          setSaveStatus('saved');
          dispatch(setEditorDirty(false));
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
          setSaveStatus('idle');
          dispatch(setEditorDirty(false));
        }
      }, 1000);
    },
    [noteId, updateNote, dispatch],
  );

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave({ title: newTitle, content });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave({ title, content: newContent });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Note not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      {/* Save indicator */}
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
        </span>
      </div>

      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
        className="w-full border-none bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
        className="min-h-[300px] w-full resize-none border-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      {/* Metadata */}
      {(note.tags.length > 0 || note.summary) && (
        <div className="space-y-3 border-t border-border pt-4">
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {note.summary && (
            <div className="rounded-md bg-surface p-3">
              <p className="text-xs font-medium text-muted-foreground">AI Summary</p>
              <p className="mt-1 text-sm text-surface-foreground">{note.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
