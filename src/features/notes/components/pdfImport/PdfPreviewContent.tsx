'use client';

import { cn } from '@/lib/utils/cn';
import type { Action, Section, ViewMode } from './pdfImportTypes';

interface PdfPreviewContentProps {
  viewMode: ViewMode;
  sections: Section[];
  content: string;
  contentDirty: boolean;
  sectionsDirty: boolean;
  dispatch: React.Dispatch<Action>;
}

export function PdfPreviewContent({
  viewMode,
  sections,
  content,
  contentDirty,
  sectionsDirty,
  dispatch,
}: PdfPreviewContentProps) {
  const handleSwitchViewMode = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    const isDirty = viewMode === 'fulltext' ? contentDirty : sectionsDirty;
    if (isDirty) {
      if (!confirm('Switching view will discard edits made in this view. Continue?')) return;
    }
    dispatch({ type: 'SET_VIEW_MODE', mode: newMode });
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1 rounded-md bg-muted/50 p-0.5">
        <button
          type="button"
          onClick={() => handleSwitchViewMode('sections')}
          className={cn(
            'flex-1 rounded px-3 py-1 text-xs font-medium transition-colors',
            viewMode === 'sections'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Sections
        </button>
        <button
          type="button"
          onClick={() => handleSwitchViewMode('fulltext')}
          className={cn(
            'flex-1 rounded px-3 py-1 text-xs font-medium transition-colors',
            viewMode === 'fulltext'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Full Text
        </button>
      </div>

      {viewMode === 'sections' ? (
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
          {sections.map((section, i) => (
            <details key={i} className="group rounded-md">
              <summary className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50">
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SECTION',
                      index: i,
                      field: 'heading',
                      value: e.target.value,
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-[calc(100%-1rem)] bg-transparent text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded px-1"
                />
              </summary>
              <div className="px-2 pb-2 pt-1">
                <textarea
                  value={section.content}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SECTION',
                      index: i,
                      field: 'content',
                      value: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full resize-y rounded border border-border bg-background px-2 py-1.5 text-sm text-muted-foreground whitespace-pre-wrap focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </details>
          ))}
        </div>
      ) : (
        <textarea
          id="pdf-content"
          value={content}
          onChange={(e) => dispatch({ type: 'SET_CONTENT', value: e.target.value })}
          rows={10}
          className="max-h-64 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}
