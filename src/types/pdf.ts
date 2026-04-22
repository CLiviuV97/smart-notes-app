import { z } from 'zod';

export interface ExtractedPdf {
  title: string;
  content: string;
  pageCount: number;
  extractedChars: number;
  summary: string;
  tags: string[];
  highlights: string[];
  sections: { heading: string; content: string }[];
  warnings: string[];
}

export const extractedPdfSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  pageCount: z.number().int().min(1),
  summary: z.string().max(300),
  tags: z.array(z.string().max(30)).max(5),
  highlights: z.array(z.string().max(200)).min(1).max(5),
  sections: z.array(z.object({
    heading: z.string().max(100),
    content: z.string(),
  })).min(1).max(30),
  warnings: z.array(z.string()).max(10).default([]),
});

export type ExtractedPdfAIResponse = z.infer<typeof extractedPdfSchema>;
