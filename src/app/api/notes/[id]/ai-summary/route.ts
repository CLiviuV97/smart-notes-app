import { withErrorHandler } from '@/server/middleware/withErrorHandler';
import { withAuth } from '@/server/middleware/withAuth';
import { checkAIRateLimit } from '@/server/middleware/rateLimit';
import { aiSummaryServiceFactory } from '@/server/services/AISummaryService';

const service = aiSummaryServiceFactory();

export const POST = withErrorHandler(
  withAuth(async (_req, ctx, user) => {
    checkAIRateLimit(user.uid);
    const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
    const note = await service.generateSummary(user.uid, id);
    return Response.json(note);
  }),
);
