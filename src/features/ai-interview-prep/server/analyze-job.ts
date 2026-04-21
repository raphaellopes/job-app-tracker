"use server";

import { Type } from "@google/genai";

import type { Job } from "@/db/schema";

import { gemini, GEMINI_MODEL } from "@/lib/ai/gemini";

import type { InterviewPrepResult } from "@/features/ai-interview-prep/types";

export const analyzeJob = async (job: Job): Promise<InterviewPrepResult | null> => {
  const { jobTitle, description } = job;
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Analyze this job application for a ${jobTitle}. 
    Job Description: ${description}. 
    Please provide: 
    1. 5 critical keywords/skills for the resume.
    2. 3 likely interview questions based on the role.
    3. An estimated matching score (0-100) assuming a general senior frontend background.
    4. A quick tip for the application.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          mockQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          resumeMatchScore: {
            type: Type.NUMBER,
          },
          tips: {
            type: Type.STRING,
          },
        },
        required: ["suggestedSkills", "mockQuestions", "resumeMatchScore", "tips"],
      },
    },
  });

  try {
    const parsedResponse = JSON.parse(response?.text?.trim() ?? "") as InterviewPrepResult;
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return null;
  }
};
