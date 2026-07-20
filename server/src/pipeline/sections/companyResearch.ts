import type { ResearchSection } from "@interviewiq/shared";
import type { LLMProvider } from "../../llm/types.js";
import { generateJson } from "../generateJson.js";
import { researchSectionSchema } from "../schemas.js";
import { buildCompanyResearchPrompt } from "../prompts/companyResearch.js";

export async function companyResearch(
  provider: LLMProvider,
  jobDescriptionText: string
): Promise<ResearchSection> {
  return generateJson({
    provider,
    system: "You produce only valid JSON. You never wrap output in markdown fences.",
    prompt: buildCompanyResearchPrompt(jobDescriptionText),
    schema: researchSectionSchema,
    tools: [{ type: "web_search", maxUses: 6 }],
  });
}
