import type { ResearchSection } from "@interviewiq/shared";
import type { LLMProvider } from "../../llm/types.js";
import { generateJson } from "../generateJson.js";
import { researchSectionSchema } from "../schemas.js";
import { buildInterviewerResearchPrompt } from "../prompts/interviewerResearch.js";

export async function interviewerResearch(
  provider: LLMProvider,
  interviewerProfileText: string | null,
  interviewerProfileSkipped: boolean,
  interviewerRole: string
): Promise<ResearchSection> {
  return generateJson({
    provider,
    system: "You produce only valid JSON. You never wrap output in markdown fences.",
    prompt: buildInterviewerResearchPrompt(
      interviewerProfileText,
      interviewerProfileSkipped,
      interviewerRole
    ),
    schema: researchSectionSchema,
    tools: interviewerProfileSkipped ? undefined : [{ type: "web_search", maxUses: 6 }],
  });
}
