'use client';

import { useState } from 'react';
import { FileText, Sparkles, Tag, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PDF_MAX_TAGS } from '@/lib/pdf/constants';
import { PdfPreviewContent } from './PdfPreviewContent';
import type { State, Action } from './pdfImportTypes';

type PreviewState = Extract<State, { stage: 'preview' }>;

interface PdfPreviewProps {
  state: PreviewState;
  dispatch: React.Dispatch<Action>;
  onSave: () => void;
  onDiscard: () => void;
}

export function PdfPreview({ state, dispatch, onSave, onDiscard }: PdfPreviewProps) {
  const [tagInput, setTagInput] = useState('');

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="pdf-title" className="mb-1 block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="pdf-title"
          type="text"
          value={state.title}
          onChange={(e) => dispatch({ type: 'SET_TITLE', value: e.target.value })}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Summary */}
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Summary
        </div>
        <textarea
          value={state.summary}
          onChange={(e) => dispatch({ type: 'SET_SUMMARY', value: e.target.value })}
          rows={2}
          maxLength={300}
          className="w-full resize-none rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        {state.tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_TAG', index: i })}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {state.tags.length < PDF_MAX_TAGS && (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const trimmed = tagInput.trim().toLowerCase();
                if (trimmed) {
                  dispatch({ type: 'ADD_TAG', tag: trimmed });
                  setTagInput('');
                }
              }
            }}
            placeholder="Add tag..."
            className="h-6 w-24 rounded-full border border-dashed border-border bg-transparent px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        )}
      </div>

      {/* Key Highlights */}
      {state.highlights.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            Key Highlights
          </div>
          <ul className="space-y-1">
            {state.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content area */}
      <PdfPreviewContent
        viewMode={state.viewMode}
        sections={state.sections}
        content={state.content}
        contentDirty={state.contentDirty}
        sectionsDirty={state.sectionsDirty}
        dispatch={dispatch}
      />

      {/* Metadata bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {state.extracted.pageCount} {state.extracted.pageCount === 1 ? 'page' : 'pages'}
        </span>
        <span>{state.extracted.extractedChars.toLocaleString()} characters</span>
      </div>

      {state.extracted.warnings.length > 0 && (
        <div className="rounded-md bg-warning/10 p-3 text-xs text-warning">
          {state.extracted.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onDiscard}>
          Discard
        </Button>
        <Button onClick={onSave}>Save as Note</Button>
      </div>
    </div>
  );
}
