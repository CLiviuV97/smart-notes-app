import { z } from 'zod';
import { geminiModel } from '@/lib/gemini/client';
import { AppError } from '@/server/errors/AppError';
import type { Note } from '@/types/note';
import type { INotesRepository } from '@/server/repositories/types';
import { notesRepository } from '@/server/repositories/NotesRepository';
import { NotesService } from './NotesService';

// --- Zod schema for AI response validation ---

export const aiResponseSchema = z.object({
  summary: z.string().transform((s) => s.slice(0, 300)),
  tags: z.array(z.string()).max(5),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;

// --- Interface ---

export interface IAISummaryService {
  summarize(content: string): Promise<AIResponse>;
  generateSummary(uid: string, noteId: string): Promise<Note>;
}

// --- Constants ---

const CONTENT_MAX_CHARS = 8000;
const TIMEOUT_MS = 15_000;
const STRUCTURED_PROMPT = `You are a note summarization assistant. Given a note enclosed in triple quotes, return a JSON object with exactly this schema:
{"summary": "string (max 300 chars)", "tags": ["string"] (max 5 lowercase single-word tags)}

Rules:
- summary: concise, 2-3 sentences, max 300 characters
- tags: up to 5 relevant lowercase single-word tags
- Return ONLY valid JSON, no markdown, no explanation

Note:
"""
{{CONTENT}}
"""`;

// --- Implementation ---

export class GeminiSummaryService implements IAISummaryService {
  private notesService: NotesService;

  constructor(private repo: INotesRepository) {
    this.notesService = new NotesService(repo);
  }

  async summarize(content: string): Promise<AIResponse> {
    const trimmed = content.slice(0, CONTENT_MAX_CHARS);
    const prompt = STRUCTURED_PROMPT.replace('{{CONTENT}}', trimmed);

    let rawText: string;
    try {
      rawText = await this.callGemini(prompt);
    } catch {
      throw new AppError('AI generation failed', 'AI_ERROR', 502);
    }

    // First parse attempt
    const first = this.parseResponse(rawText);
    if (first) return first;

    // Retry once on JSON parse fail
    try {
      rawText = await this.callGemini(
        prompt + '\n\nYour previous response was not valid JSON. Return ONLY valid JSON.',
      );
    } catch {
      throw new AppError('AI generation failed', 'AI_ERROR', 502);
    }

    const second = this.parseResponse(rawText);
    if (second) return second;

    throw new AppError('AI returned invalid response format', 'AI_PARSE_ERROR', 502);
  }

  async generateSummary(uid: string, noteId: string): Promise<Note> {
    const note = await this.notesService.getById(uid, noteId);

    if (!note.content) {
      throw new AppError('Note has no content', 'BAD_REQUEST', 400);
    }

    const { summary, tags } = await this.summarize(note.content);

    return this.repo.update(noteId, {
      summary,
      tags: tags.map((t) => t.toLowerCase()),
      aiGeneratedAt: new Date().toISOString(),
    });
  }

  private async callGemini(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const result = await geminiModel.generateContent(
        { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
        { signal: controller.signal },
      );
      return result.response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseResponse(raw: string): AIResponse | null {
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const json = JSON.parse(cleaned);
      return aiResponseSchema.parse(json);
    } catch {
      return null;
    }
  }
}

// --- Factory ---

export function aiSummaryServiceFactory(): IAISummaryService {
  return new GeminiSummaryService(notesRepository);
}
