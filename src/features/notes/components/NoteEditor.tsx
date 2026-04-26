'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useGetNoteQuery, useUpdateNoteMutation } from '@/features/notes/api/notesApi';
import { useAppDispatch } from '@/store';
import { setEditorDirty } from '@/features/notes/store/notesUiSlice';
import { Spinner } from '@/components/ui/Spinner';
import { TiptapEditor } from './TiptapEditor';

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
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<{ abort: () => void } | null>(null);
  const requestIdRef = useRef(0);
  const pendingPatchRef = useRef<{ title?: string; content?: string }>({});
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

  const debouncedSave = useCallback(
    (patch: { title?: string; content?: string }) => {
      dispatch(setEditorDirty(true));
      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const finalPatch = pendingPatchRef.current;
        pendingPatchRef.current = {};

        // Cancel any in-flight PATCH
        inFlightRef.current?.abort();

        const myId = ++requestIdRef.current;

        setSaveStatus('saving');
        const promise = updateNote({ id: noteId, ...finalPatch });
        inFlightRef.current = promise;

        try {
          await promise.unwrap();
          if (myId !== requestIdRef.current) return; // superseded
          setSaveStatus('saved');
          dispatch(setEditorDirty(false));
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
          idleTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err: unknown) {
          if (myId !== requestIdRef.current) return;
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setSaveStatus('idle');
          dispatch(setEditorDirty(false));
        }
      }, 2000);
    },
    [noteId, updateNote, dispatch],
  );

  // Cleanup timers and in-flight requests
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      inFlightRef.current?.abort();
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      debouncedSave({ content: newContent });
    },
    [debouncedSave],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center font-serif italic text-ink-3">
        Note not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-4 px-20 py-14 font-serif max-md:px-5">
      {/* Save indicator — fixed height to prevent layout shift */}
      <div className="flex h-5 items-center justify-end">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase text-ink-3">
          {saveStatus === 'saving' && (
            <>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-ink-4"
                style={{ animation: 'pulseDot 1s ease-in-out infinite' }}
              />
              Saving
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
              Saved
            </>
          )}
          {saveStatus === 'idle' && <>&nbsp;</>}
        </span>
      </div>

      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
        className="w-full border-none bg-transparent text-[40px] font-medium leading-[1.12] tracking-[-0.02em] text-ink placeholder:text-ink-4 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
          {new Date(note.updatedAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {note.tags.length > 0 && (
          <>
            <span className="text-ink-4">|</span>
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full border border-rule bg-paper-2 px-2.5 py-0.5 font-sans text-[11px] text-ink-2"
              >
                {tag}
              </span>
            ))}
          </>
        )}
      </div>

      {note.summary && (
        <div className="rounded-[5px] border-l-2 border-margin-red bg-paper-2 px-4 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-accent">
            <Sparkles className="h-3 w-3" />
            AI Summary
          </p>
          <p className="font-serif text-[14px] italic leading-[1.55] text-ink-2">{note.summary}</p>
        </div>
      )}

      <TiptapEditor
        content={content}
        onChange={handleContentChange}
        className="tiptap-editor min-h-[300px] w-full text-[17px] leading-[1.55] text-ink"
      />
    </div>
  );
}
