import { z } from "zod";

export const claimSchema = z.object({
  text: z.string(),
  confidence: z.enum(["sourced", "inference"]),
  citations: z
    .array(z.object({ url: z.string(), title: z.string().optional(), snippet: z.string().optional() }))
    .optional(),
});

export const sectionDetailSchema = z.object({
  heading: z.string(),
  body: z.string(),
  claims: z.array(claimSchema),
});

export const researchSectionSchema = z.object({
  summary: z.string(),
  details: z.array(sectionDetailSchema),
});

export const roleFitSectionSchema = z.object({
  summary: z.string(),
  strongMatches: z.array(sectionDetailSchema),
  potentialGaps: z.array(sectionDetailSchema),
});

export const interviewQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(["strategic", "behavioral", "technical", "leadership"]),
  rationale: z.string(),
});

export const likelyQuestionsSectionSchema = z.object({
  summary: z.string(),
  questions: z.array(interviewQuestionSchema),
});

export const suggestedAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  groundedIn: z.array(z.string()),
});

export const suggestedAnswersSectionSchema = z.object({
  summary: z.string(),
  answers: z.array(suggestedAnswerSchema),
});

export const questionToAskSchema = z.object({
  question: z.string(),
  rationale: z.string(),
});

export const questionsToAskSectionSchema = z.object({
  summary: z.string(),
  questions: z.array(questionToAskSchema),
});
