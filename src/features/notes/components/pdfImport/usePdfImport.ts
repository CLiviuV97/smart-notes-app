import { useReducer, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/useToast';
import { useExtractPdfMutation, useCreateNoteMutation } from '@/features/notes/api/notesApi';
import { useAppDispatch } from '@/store';
import { setSelectedNote } from '@/features/notes/store/notesUiSlice';
import { PDF_MAX_TAGS, PDF_MAX_TAG_LENGTH } from '@/lib/pdf/constants';
import type { State, Action } from './pdfImportTypes';

const initialState: State = { stage: 'idle' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'EXTRACT_START':
      return { stage: 'uploading', abortController: action.abortController };

    case 'EXTRACT_SUCCESS':
      return {
        stage: 'preview',
        extracted: action.extracted,
        title: action.extracted.title,
        content: action.extracted.content,
        summary: action.extracted.summary,
        tags: action.extracted.tags,
        highlights: action.extracted.highlights,
        sections: action.extracted.sections,
        viewMode: 'sections',
        contentDirty: false,
        sectionsDirty: false,
      };

    case 'EXTRACT_CANCEL':
    case 'EXTRACT_FAILED':
    case 'RESET':
      return initialState;

    case 'SET_TITLE':
      if (state.stage !== 'preview') return state;
      return { ...state, title: action.value };

    case 'SET_CONTENT':
      if (state.stage !== 'preview') return state;
      return { ...state, content: action.value, contentDirty: true };

    case 'SET_SUMMARY':
      if (state.stage !== 'preview') return state;
      return { ...state, summary: action.value };

    case 'REMOVE_TAG':
      if (state.stage !== 'preview') return state;
      return { ...state, tags: state.tags.filter((_, i) => i !== action.index) };

    case 'ADD_TAG': {
      if (state.stage !== 'preview') return state;
      const tag = action.tag.trim().toLowerCase();
      if (!tag || tag.length > PDF_MAX_TAG_LENGTH) return state;
      if (state.tags.length >= PDF_MAX_TAGS) return state;
      if (state.tags.includes(tag)) return state;
      return { ...state, tags: [...state.tags, tag] };
    }

    case 'UPDATE_SECTION': {
      if (state.stage !== 'preview') return state;
      const updated = state.sections.map((s, i) =>
        i === action.index ? { ...s, [action.field]: action.value } : s,
      );
      return { ...state, sections: updated, sectionsDirty: true };
    }

    case 'SET_VIEW_MODE':
      if (state.stage !== 'preview') return state;
      return {
        ...state,
        viewMode: action.mode,
        contentDirty: false,
        sectionsDirty: false,
      };

    case 'SAVE_START':
      if (state.stage !== 'preview') return state;
      return { ...state, stage: 'saving' };

    case 'SAVE_FAILED':
      if (state.stage !== 'saving') return state;
      return { ...state, stage: 'preview' };

    default:
      return state;
  }
}

export function usePdfImport(onClose: () => void) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const appDispatch = useAppDispatch();
  const { toast } = useToast();
  const [extractPdf] = useExtractPdfMutation();
  const [createNote] = useCreateNoteMutation();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const controller = new AbortController();
      dispatch({ type: 'EXTRACT_START', abortController: controller });

      try {
        const trigger = extractPdf(file);

        // Store abort handle so cancel can use it
        const abortListener = () => trigger.abort();
        controller.signal.addEventListener('abort', abortListener);

        const result = await trigger.unwrap();
        controller.signal.removeEventListener('abort', abortListener);
        dispatch({ type: 'EXTRACT_SUCCESS', extracted: result });
      } catch (err) {
        if (controller.signal.aborted) {
          dispatch({ type: 'EXTRACT_CANCEL' });
          return;
        }
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? 'Failed to extract PDF';
        toast({ title: 'PDF Import Error', description: message, variant: 'error' });
        dispatch({ type: 'EXTRACT_FAILED' });
      }
    },
    [extractPdf, toast],
  );

  const handleCancel = useCallback(() => {
    if (state.stage === 'uploading') {
      state.abortController.abort();
    }
  }, [state]);

  const handleSave = useCallback(async () => {
    if (state.stage !== 'preview') return;

    dispatch({ type: 'SAVE_START' });
    try {
      const finalContent =
        state.viewMode === 'sections'
          ? state.sections.map((s) => `## ${s.heading}\n\n${s.content}`).join('\n\n')
          : state.content;

      const note = await createNote({
        title: state.title.trim() || 'Untitled',
        content: finalContent,
        summary: state.summary || null,
        tags: state.tags.length > 0 ? state.tags : undefined,
        aiGeneratedAt: new Date().toISOString(),
      }).unwrap();

      toast({ title: 'Note created', description: 'PDF content saved as a new note.' });
      appDispatch(setSelectedNote(note.id));
      router.push(`/notes/${note.id}`);
      onClose();
    } catch {
      toast({
        title: 'Save failed',
        description: 'Could not create note. Please try again.',
        variant: 'error',
      });
      dispatch({ type: 'SAVE_FAILED' });
    }
  }, [state, createNote, toast, appDispatch, router, onClose]);

  return { state, dispatch, handleDrop, handleCancel, handleSave };
}
