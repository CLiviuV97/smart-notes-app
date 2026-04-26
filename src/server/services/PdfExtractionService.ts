import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '@/server/errors/AppError';
import { extractedPdfSchema } from '@/types/pdf';
import type { ExtractedPdf, ExtractedPdfAIResponse } from '@/types/pdf';
import { PDF_MAX_PAGES } from '@/lib/pdf/constants';

// --- Interface ---

export interface IPdfExtractionService {
  extract(buffer: Buffer): Promise<ExtractedPdf>;
}

// --- Constants ---

const TIMEOUT_MS = 55_000;

const EXTRACTION_PROMPT = `You are a PDF analysis assistant. Extract and analyze the provided PDF document.

Return a JSON object with exactly this schema:
{"title": "string", "content": "string", "pageCount": number, "summary": "string", "tags": ["string"], "highlights": ["string"], "sections": [{"heading": "string", "content": "string"}], "warnings": ["string"]}

Rules:
- title: use the document title, first heading, or first meaningful line (max 200 chars)
- content: extract ALL text faithfully, preserve paragraph breaks as newlines
- pageCount: the total number of pages in the PDF document
- summary: 2-3 sentences summarizing the document, max 300 characters
- tags: up to 5 tags, lowercase, single-word, describing the document's topics
- highlights: 3-5 key insights, quotes, or action items from the document (max 200 chars each)
- sections: split the document into logical sections with a descriptive heading and the section content (1-30 sections)
- warnings: list any issues (empty array if none)
- Return ONLY valid JSON, no markdown, no explanation`;

// --- Implementation ---

export class GeminiPdfExtractionService implements IPdfExtractionService {
  private model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 32768,
        responseMimeType: 'application/json',
      },
    });
  }

  async extract(buffer: Buffer): Promise<ExtractedPdf> {
    const aiResponse = await this.callGemini(buffer);

    if (aiResponse.pageCount > PDF_MAX_PAGES) {
      throw new AppError(
        `PDF has ${aiResponse.pageCount} pages. Maximum allowed is ${PDF_MAX_PAGES}.`,
        'PDF_TOO_LARGE',
        400,
      );
    }

    return {
      title: aiResponse.title,
      content: aiResponse.content,
      pageCount: aiResponse.pageCount,
      extractedChars: aiResponse.content.length,
      summary: aiResponse.summary,
      tags: aiResponse.tags,
      highlights: aiResponse.highlights,
      sections: aiResponse.sections,
      warnings: aiResponse.warnings,
    };
  }

  private async callGemini(buffer: Buffer): Promise<ExtractedPdfAIResponse> {
    let rawText: string;
    try {
      rawText = await this.callGeminiRaw(buffer, EXTRACTION_PROMPT);
    } catch {
      throw new AppError('PDF extraction failed', 'AI_ERROR', 502);
    }

    // First parse attempt
    const first = this.parseResponse(rawText);
    if (first) return first;

    // Retry once on JSON parse fail
    try {
      rawText = await this.callGeminiRaw(
        buffer,
        EXTRACTION_PROMPT +
          '\n\nYour previous response was not valid JSON. Return ONLY valid JSON.',
      );
    } catch {
      throw new AppError('PDF extraction failed', 'AI_ERROR', 502);
    }

    const second = this.parseResponse(rawText);
    if (second) return second;

    throw new AppError('AI returned invalid response format', 'AI_PARSE_ERROR', 502);
  }

  private async callGeminiRaw(buffer: Buffer, prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const result = await this.model.generateContent(
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: buffer.toString('base64'),
                  },
                },
                { text: prompt },
              ],
            },
          ],
        },
        { signal: controller.signal },
      );
      return result.response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseResponse(raw: string): ExtractedPdfAIResponse | null {
    try {
      const cleaned = raw
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '')
        .trim();
      const json = JSON.parse(cleaned);
      return extractedPdfSchema.parse(json);
    } catch {
      return null;
    }
  }
}

// --- Factory ---

export function pdfExtractionServiceFactory(): IPdfExtractionService {
  return new GeminiPdfExtractionService();
}
