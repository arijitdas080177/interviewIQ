import { GROUNDING_INSTRUCTIONS, jsonSchemaBlock } from "./shared.js";

export const LIKELY_QUESTIONS_SCHEMA_DESCRIPTION = jsonSchemaBlock(`
{
  "summary": string,
  "questions": [
    {
      "question": string,
      "category": "strategic" | "behavioral" | "technical" | "leadership",
      "rationale": string    // why this question is likely, given the interviewer's role/seniority and the JD
    }
  ]
}
`);

export function buildLikelyQuestionsPrompt(context: {
  jobDescriptionText: string;
  interviewerRole: string;
  companyResearchSummary: string;
  interviewerResearchSummary: string;
  roleFitSummary: string;
}): string {
  return `${GROUNDING_INSTRUCTIONS}

${LIKELY_QUESTIONS_SCHEMA_DESCRIPTION}

TASK: Generate 10-14 likely interview questions for a Director+ level
candidate, tailored to the job description and to the interviewer's role and
seniority (e.g. a CFO interviewer probes financial rigor; a peer Director
probes collaboration). Span strategic, behavioral, technical, and leadership
dimensions appropriate for executive roles. Every question needs a brief
rationale connecting it to the interviewer's likely focus or the JD.
Claims-with-confidence do not apply here (there is no "claims" field) —
just produce well-reasoned questions.

<job_description>
${context.jobDescriptionText}
</job_description>

<interviewer_role>
${context.interviewerRole}
</interviewer_role>

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
