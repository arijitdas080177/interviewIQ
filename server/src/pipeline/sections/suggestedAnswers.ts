import type { LikelyQuestionsSection, SuggestedAnswersSection } from "@interviewiq/shared";
import type { LLMProvider } from "../../llm/types.js";
import { generateJson } from "../generateJson.js";
import { suggestedAnswersSectionSchema } from "../schemas.js";
import { buildSuggestedAnswersPrompt } from "../prompts/suggestedAnswers.js";

export async function suggestedAnswers(
  provider: LLMProvider,
  resumeText: string,
  likelyQuestionsResult: LikelyQuestionsSection
): Promise<SuggestedAnswersSection> {
  return generateJson({
    provider,
    system: "You produce only valid JSON. You never wrap output in markdown fences.",
    prompt: buildSuggestedAnswersPrompt(resumeText, likelyQuestionsResult.questions),
    schema: suggestedAnswersSectionSchema,
  });
}
