import { withErrorHandler } from '@/server/middleware/withErrorHandler';
import { withAuth } from '@/server/middleware/withAuth';
import { notesServiceFactory } from '@/server/services/NotesService';
import { updateNoteSchema } from '@/lib/validators/noteSchemas';

const service = notesServiceFactory();

export const GET = withErrorHandler(
  withAuth(async (_req, ctx, user) => {
    const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
    const note = await service.getById(user.uid, id);
    return Response.json(note);
  }),
);

export const PATCH = withErrorHandler(
  withAuth(async (req, ctx, user) => {
    const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
    const patch = updateNoteSchema.parse(await req.json());
    const note = await service.update(user.uid, id, patch);
    return Response.json(note);
  }),
);

export const DELETE = withErrorHandler(
  withAuth(async (_req, ctx, user) => {
    const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
    await service.delete(user.uid, id);
    return new Response(null, { status: 204 });
  }),
);
