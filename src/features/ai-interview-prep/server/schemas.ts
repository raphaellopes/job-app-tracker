import { z } from "zod";

export const interviewPrepSchema = z.object({
  suggestedSkills: z.array(z.string().min(1)).min(1),
  mockQuestions: z.array(z.string().min(1)).min(1),
  resumeMatchScore: z.number().int().min(0).max(100),
  tips: z.string().min(1),
});
