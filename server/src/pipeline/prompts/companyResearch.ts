import { GROUNDING_INSTRUCTIONS, jsonSchemaBlock } from "./shared.js";

export const COMPANY_RESEARCH_SCHEMA_DESCRIPTION = jsonSchemaBlock(`
{
  "summary": string,        // 2-3 sentence overview of the company relevant to interview prep
  "details": [
    {
      "heading": string,    // e.g. "Mission & recent news", "Financials & market position",
                             // "Culture signals", "Leadership team", "Competitors",
                             // "Strategic priorities (from the JD)"
      "body": string,
      "claims": [ { "text": string, "confidence": "sourced" | "inference", "citations"?: [{ "url": string, "title"?: string, "snippet"?: string }] } ]
    }
  ]
}
`);

export function buildCompanyResearchPrompt(jobDescriptionText: string): string {
  return `${GROUNDING_INSTRUCTIONS}

${COMPANY_RESEARCH_SCHEMA_DESCRIPTION}

TASK: Identify the hiring company from the job description below, then
research it for an executive (Director+) candidate preparing to interview
there. Use web search to ground claims in current, verifiable information.
Cover: mission, recent news, financials/market position, culture signals,
leadership team, competitors, and strategic priorities you can infer from
the job description. If you cannot confidently identify the company, say so
plainly rather than guessing a specific company's facts.

<job_description>
${jobDescriptionText}
</job_description>`;
}
