import type { RoleFitSection } from "@interviewiq/shared";
import type { LLMProvider } from "../../llm/types.js";
import { generateJson } from "../generateJson.js";
import { roleFitSectionSchema } from "../schemas.js";
import { buildRoleFitPrompt } from "../prompts/roleFitAnalysis.js";

export async function roleFitAnalysis(
  provider: LLMProvider,
  resumeText: string,
  jobDescriptionText: string
): Promise<RoleFitSection> {
  return generateJson({
    provider,
    system: "You produce only valid JSON. You never wrap output in markdown fences.",
    prompt: buildRoleFitPrompt(resumeText, jobDescriptionText),
    schema: roleFitSectionSchema,
  });
}
