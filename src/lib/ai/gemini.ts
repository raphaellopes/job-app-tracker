import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

export const GEMINI_MODEL = "gemini-3-flash-preview";

export const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
