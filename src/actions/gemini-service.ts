import { GoogleGenAI, Type } from "@google/genai";
import { Job } from "@/db/schema";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const analyzeJob = async (job: Job) => {
  console.log("Analyzing job:", job);
  const { jobTitle, description } = job;
  const response = await gemini.models.generateContent({
    model: "gemini-3-flash-preview",
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

  console.log("Gemini response:", response);

  try {
    const parsedResponse = JSON.parse(response?.text?.trim() ?? "");
    console.log("Parsed response:", parsedResponse);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return null;
  }
};
