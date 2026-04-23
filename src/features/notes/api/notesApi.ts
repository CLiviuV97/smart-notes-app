import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase/client';
import type { Note, PaginatedResult } from '@/types/note';
import type { ExtractedPdf } from '@/types/pdf';

interface ListNotesParams {
  cursor?: string;
  limit?: number;
}

export const notesApi = createApi({
  reducerPath: 'notesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: async (headers) => {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notes', 'Note'],
  endpoints: (builder) => ({
    listNotes: builder.query<PaginatedResult<Note>, ListNotesParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.cursor) searchParams.set('cursor', params.cursor);
        if (params.limit) searchParams.set('limit', String(params.limit));
        const qs = searchParams.toString();
        return `/notes${qs ? `?${qs}` : ''}`;
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        const existingIds = new Set(currentCache.items.map((n) => n.id));
        const unique = newItems.items.filter((n) => !existingIds.has(n.id));
        currentCache.items.push(...unique);
        currentCache.nextCursor = newItems.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Note' as const, id })),
              { type: 'Notes', id: 'LIST' },
            ]
          : [{ type: 'Notes', id: 'LIST' }],
    }),

    getNote: builder.query<Note, string>({
      query: (id) => `/notes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Note', id }],
    }),

    createNote: builder.mutation<
      Note,
      {
        title: string;
        content: string;
        summary?: string | null;
        tags?: string[];
        aiGeneratedAt?: string | null;
      }
    >({
      query: (body) => ({
        url: '/notes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
    }),

    updateNote: builder.mutation<Note, { id: string; title?: string; content?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/notes/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchNote = dispatch(
          notesApi.util.updateQueryData('getNote', id, (draft) => {
            Object.assign(draft, patch);
          }),
        );
        const patchList = dispatch(
          notesApi.util.updateQueryData('listNotes', 'listNotes' as never, (draft) => {
            const note = draft.items.find((n) => n.id === id);
            if (note) Object.assign(note, patch);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchNote.undo();
          patchList.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Note', id },
        { type: 'Notes', id: 'LIST' },
      ],
    }),

    deleteNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Note', id },
        { type: 'Notes', id: 'LIST' },
      ],
    }),

    generateAISummary: builder.mutation<Note, string>({
      query: (id) => ({
        url: `/notes/${id}/ai-summary`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Note', id }],
    }),

    extractPdf: builder.mutation<ExtractedPdf, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/notes/import-pdf', method: 'POST', body: formData };
      },
    }),
  }),
});

export const {
  useListNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGenerateAISummaryMutation,
  useExtractPdfMutation,
} = notesApi;
