'use client';

import { FileText } from 'lucide-react';

export default function NotesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <FileText className="h-16 w-16 text-muted-foreground/50" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Select a note
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a note from the sidebar or create a new one
      </p>
    </div>
  );
}
