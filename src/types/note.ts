export interface Note {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}
