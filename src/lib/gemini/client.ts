import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 512,
    responseMimeType: 'application/json',
  },
});
