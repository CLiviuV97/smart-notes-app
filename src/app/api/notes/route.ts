import { withErrorHandler } from '@/server/middleware/withErrorHandler';
import { withAuth } from '@/server/middleware/withAuth';
import { notesServiceFactory } from '@/server/services/NotesService';
import { listQuerySchema, createNoteSchema } from '@/lib/validators/noteSchemas';

const service = notesServiceFactory();

export const GET = withErrorHandler(
  withAuth(async (req, _ctx, user) => {
    const { searchParams } = new URL(req.url);
    const params = listQuerySchema.parse({
      cursor: searchParams.get('cursor') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    const result = await service.list(user.uid, params);
    return Response.json(result);
  }),
);

export const POST = withErrorHandler(
  withAuth(async (req, _ctx, user) => {
    const body = createNoteSchema.parse(await req.json());
    const note = await service.create(user.uid, body);
    return Response.json(note, { status: 201 });
  }),
);
