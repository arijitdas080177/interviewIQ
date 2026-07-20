import { GROUNDING_INSTRUCTIONS, jsonSchemaBlock } from "./shared.js";

export const INTERVIEWER_RESEARCH_SCHEMA_DESCRIPTION = jsonSchemaBlock(`
{
  "summary": string,        // 2-3 sentence overview of the interviewer relevant to interview prep
  "details": [
    {
      "heading": string,    // e.g. "Career trajectory", "Tenure & scope in current role",
                             // "Likely priorities / pain points", "Public signals (talks, posts, articles)"
      "body": string,
      "claims": [ { "text": string, "confidence": "sourced" | "inference", "citations"?: [{ "url": string, "title"?: string, "snippet"?: string }] } ]
    }
  ]
}
`);

export function buildInterviewerResearchPrompt(
  interviewerProfileText: string | null,
  interviewerProfileSkipped: boolean,
  interviewerRole: string
): string {
  if (interviewerProfileSkipped || !interviewerProfileText) {
    return `${GROUNDING_INSTRUCTIONS}

${INTERVIEWER_RESEARCH_SCHEMA_DESCRIPTION}

TASK: The candidate does not yet know who will be interviewing them, only
the interviewer's role/title: "${interviewerRole}". Produce a section that
reasons generically about what someone in this role would likely probe for
in an interview (mark every claim as "inference" — there is no interviewer
identity to research). Keep the summary explicit that this is generic
role-based guidance, not research on a specific person.`;
  }

  return `${GROUNDING_INSTRUCTIONS}

${INTERVIEWER_RESEARCH_SCHEMA_DESCRIPTION}

TASK: Research the interviewer for an executive (Director+) candidate. The
interviewer's role is "${interviewerRole}". Use web search on the profile
information below (which may include a LinkedIn URL, pasted profile text,
or a name) to find their career trajectory, tenure and scope in their
current role, and any publicly available context (LinkedIn activity, talks,
articles) that signals their likely interview style or focus areas, given
their function. If web search cannot find the specific person (e.g. a
LinkedIn URL that isn't publicly indexed), say so plainly in the summary and
suggest the candidate paste the profile's About/Experience text directly for
better results, then fall back to generic role-based inference (marked
"inference") for the rest of the section.

<interviewer_profile>
${interviewerProfileText}
</interviewer_profile>`;
}
