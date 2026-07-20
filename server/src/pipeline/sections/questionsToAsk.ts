import type { QuestionsToAskSection, ResearchSection, RoleFitSection } from "@interviewiq/shared";
import type { LLMProvider } from "../../llm/types.js";
import { generateJson } from "../generateJson.js";
import { questionsToAskSectionSchema } from "../schemas.js";
import { buildQuestionsToAskPrompt } from "../prompts/questionsToAsk.js";

export async function questionsToAsk(
  provider: LLMProvider,
  companyResearchResult: ResearchSection,
  interviewerResearchResult: ResearchSection,
  roleFitResult: RoleFitSection
): Promise<QuestionsToAskSection> {
  return generateJson({
    provider,
    system: "You produce only valid JSON. You never wrap output in markdown fences.",
    prompt: buildQuestionsToAskPrompt({
      companyResearchSummary: companyResearchResult.summary,
      interviewerResearchSummary: interviewerResearchResult.summary,
      roleFitSummary: roleFitResult.summary,
    }),
    schema: questionsToAskSectionSchema,
  });
}
