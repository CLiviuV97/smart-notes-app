import { http, HttpResponse } from 'msw';

const mockNotes = [
  {
    id: 'note-1',
    title: 'Test Note 1',
    content: 'Content of note 1',
    summary: null,
    tags: [],
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    aiGeneratedAt: null,
  },
  {
    id: 'note-2',
    title: 'Test Note 2',
    content: 'Content of note 2',
    summary: 'AI generated summary',
    tags: ['test'],
    userId: 'user-1',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    aiGeneratedAt: '2026-01-02T00:00:00.000Z',
  },
];

export const handlers = [
  // List notes
  http.get('/api/notes', () => {
    return HttpResponse.json({
      items: mockNotes,
      nextCursor: null,
    });
  }),

  // Get single note
  http.get('/api/notes/:id', ({ params }) => {
    const note = mockNotes.find((n) => n.id === params.id);
    if (!note) {
      return HttpResponse.json(
        { error: 'NOT_FOUND', message: 'Note not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json(note);
  }),

  // Create note
  http.post('/api/notes', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 'note-new',
        ...body,
        userId: 'user-1',
        tags: body.tags ?? [],
        summary: body.summary ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGeneratedAt: null,
      },
      { status: 201 },
    );
  }),

  // Generate AI summary
  http.post('/api/notes/:id/ai-summary', ({ params }) => {
    const note = mockNotes.find((n) => n.id === params.id);
    if (!note) {
      return HttpResponse.json(
        { error: 'NOT_FOUND', message: 'Note not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      ...note,
      summary: 'AI generated summary for testing',
      aiGeneratedAt: new Date().toISOString(),
    });
  }),
];
