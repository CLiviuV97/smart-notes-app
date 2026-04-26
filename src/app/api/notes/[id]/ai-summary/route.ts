import { protectedRoute } from '@/server/middleware/protectedRoute';
import { checkAIRateLimit } from '@/server/middleware/rateLimit';
import { aiSummaryServiceFactory } from '@/server/services/AISummaryService';
import type { RouteContext } from '@/types/api';

const service = aiSummaryServiceFactory();

type Ctx = RouteContext<{ id: string }>;

export const POST = protectedRoute<Ctx>(async (_req, ctx, user) => {
  checkAIRateLimit(user.uid);
  const { id } = await ctx.params;
  const note = await service.generateSummary(user.uid, id);
  return Response.json(note);
});
