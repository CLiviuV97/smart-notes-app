import type { ExtractedPdf } from '@/types/pdf';

export type ViewMode = 'sections' | 'fulltext';

export type Section = { heading: string; content: string };

interface BasePreviewFields {
  extracted: ExtractedPdf;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  highlights: string[];
  sections: Section[];
  viewMode: ViewMode;
  contentDirty: boolean;
  sectionsDirty: boolean;
}

export type State =
  | { stage: 'idle' }
  | { stage: 'uploading'; abortController: AbortController }
  | ({ stage: 'preview' } & BasePreviewFields)
  | ({ stage: 'saving' } & BasePreviewFields);

export type Action =
  | { type: 'EXTRACT_START'; abortController: AbortController }
  | { type: 'EXTRACT_SUCCESS'; extracted: ExtractedPdf }
  | { type: 'EXTRACT_CANCEL' }
  | { type: 'EXTRACT_FAILED' }
  | { type: 'SET_TITLE'; value: string }
  | { type: 'SET_CONTENT'; value: string }
  | { type: 'SET_SUMMARY'; value: string }
  | { type: 'REMOVE_TAG'; index: number }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'UPDATE_SECTION'; index: number; field: 'heading' | 'content'; value: string }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_FAILED' }
  | { type: 'RESET' };
