import { GROUNDING_INSTRUCTIONS, jsonSchemaBlock } from "./shared.js";

export const QUESTIONS_TO_ASK_SCHEMA_DESCRIPTION = jsonSchemaBlock(`
{
  "summary": string,
  "questions": [
    { "question": string, "rationale": string }
  ]
}
`);

export function buildQuestionsToAskPrompt(context: {
  companyResearchSummary: string;
  interviewerResearchSummary: string;
  roleFitSummary: string;
}): string {
  return `${GROUNDING_INSTRUCTIONS}

${QUESTIONS_TO_ASK_SCHEMA_DESCRIPTION}

TASK: Generate 6-8 smart questions the candidate can ask the interviewer,
informed by the company and interviewer research below. These should signal
executive-level strategic thinking, not generic "what's the culture like"
questions. Each needs a short rationale for why it's a good question to ask
in this specific context.

<company_research_summary>
${context.companyResearchSummary}
</company_research_summary>

<interviewer_research_summary>
${context.interviewerResearchSummary}
</interviewer_research_summary>

<role_fit_summary>
${context.roleFitSummary}
</role_fit_summary>`;
}
