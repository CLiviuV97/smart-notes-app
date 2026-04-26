import { protectedRoute } from '@/server/middleware/protectedRoute';
import { notesServiceFactory } from '@/server/services/NotesService';
import { updateNoteSchema } from '@/lib/validators/noteSchemas';
import type { RouteContext } from '@/types/api';

const service = notesServiceFactory();

type Ctx = RouteContext<{ id: string }>;

export const GET = protectedRoute<Ctx>(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const note = await service.getById(user.uid, id);
  return Response.json(note);
});

export const PATCH = protectedRoute<Ctx>(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const patch = updateNoteSchema.parse(await req.json());
  const note = await service.update(user.uid, id, patch);
  return Response.json(note);
});

export const DELETE = protectedRoute<Ctx>(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  await service.delete(user.uid, id);
  return new Response(null, { status: 204 });
});
