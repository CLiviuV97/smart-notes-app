import { withErrorHandler } from '@/server/middleware/withErrorHandler';
import { withAuth } from '@/server/middleware/withAuth';
import { isPdfMagicBytes } from '@/server/utils/pdfValidation';
import {
  checkPdfRateLimit,
  acquirePdfConcurrency,
  releasePdfConcurrency,
} from '@/server/middleware/rateLimit';
import { pdfExtractionServiceFactory } from '@/server/services/PdfExtractionService';
import { AppError } from '@/server/errors/AppError';

export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const service = pdfExtractionServiceFactory();

export const POST = withErrorHandler(
  withAuth(async (req, _ctx, user) => {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new AppError('No PDF file provided', 'BAD_REQUEST', 400);
    }

    // Validate MIME type
    if (file.type !== 'application/pdf') {
      throw new AppError('File must be a PDF', 'BAD_REQUEST', 400);
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError('PDF exceeds 10MB limit', 'BAD_REQUEST', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate magic bytes
    if (!isPdfMagicBytes(buffer)) {
      throw new AppError('File must be a PDF', 'BAD_REQUEST', 400);
    }

    // Rate limit & concurrency
    checkPdfRateLimit(user.uid);
    acquirePdfConcurrency(user.uid);

    try {
      const extracted = await service.extract(buffer);
      return Response.json(extracted);
    } finally {
      releasePdfConcurrency(user.uid);
    }
  }),
);
