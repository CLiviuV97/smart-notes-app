import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase/client';
import type { Note, PaginatedResult } from '@/types/note';

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
        currentCache.items.push(...newItems.items);
        currentCache.nextCursor = newItems.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
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

    createNote: builder.mutation<Note, { title: string; content: string }>({
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
        const patchResult = dispatch(
          notesApi.util.updateQueryData('getNote', id, (draft) => {
            Object.assign(draft, patch);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
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
  }),
});

export const {
  useListNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGenerateAISummaryMutation,
} = notesApi;
