import { GROUNDING_INSTRUCTIONS, jsonSchemaBlock } from "./shared.js";

export const ROLE_FIT_SCHEMA_DESCRIPTION = jsonSchemaBlock(`
{
  "summary": string,                 // 2-3 sentence overview of the candidate's fit for the role
  "strongMatches": [                 // requirements from the JD the resume clearly satisfies
    {
      "heading": string,             // short label, e.g. "P&L ownership"
      "body": string,                // 2-4 sentences explaining the match, citing resume specifics
      "claims": [ { "text": string, "confidence": "sourced" | "inference", "citations"?: [{ "url": string, "title"?: string, "snippet"?: string }] } ]
    }
  ],
  "potentialGaps": [                 // requirements the resume does not clearly cover, to prepare for
    { "heading": string, "body": string, "claims": [ ... same shape as above ... ] }
  ]
}
`);

export function buildRoleFitPrompt(resumeText: string, jobDescriptionText: string): string {
  return `${GROUNDING_INSTRUCTIONS}

${ROLE_FIT_SCHEMA_DESCRIPTION}

TASK: Map the job description's requirements against the candidate's resume.
Identify concrete strong matches (with specific resume evidence: metrics,
titles, scope) and potential gaps the candidate should be ready to address.
This section does not need web search — reason only from the text below.

<resume>
${resumeText}
</resume>

<job_description>
${jobDescriptionText}
</job_description>`;
}
