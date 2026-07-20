import type { LikelyQuestionsSection, ResearchSection, RoleFitSection } from "@interviewiq/shared";
import type { LLMProvider } from "../../llm/types.js";
import { generateJson } from "../generateJson.js";
import { likelyQuestionsSectionSchema } from "../schemas.js";
import { buildLikelyQuestionsPrompt } from "../prompts/likelyQuestions.js";

export async function likelyQuestions(
  provider: LLMProvider,
  jobDescriptionText: string,
  interviewerRole: string,
  companyResearchResult: ResearchSection,
  interviewerResearchResult: ResearchSection,
  roleFitResult: RoleFitSection
): Promise<LikelyQuestionsSection> {
  return generateJson({
    provider,
    system: "You produce only valid JSON. You never wrap output in markdown fences.",
    prompt: buildLikelyQuestionsPrompt({
      jobDescriptionText,
      interviewerRole,
      companyResearchSummary: companyResearchResult.summary,
      interviewerResearchSummary: interviewerResearchResult.summary,
      roleFitSummary: roleFitResult.summary,
    }),
    schema: likelyQuestionsSectionSchema,
  });
}
