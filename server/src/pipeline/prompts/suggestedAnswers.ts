import { GROUNDING_INSTRUCTIONS, jsonSchemaBlock } from "./shared.js";
import type { InterviewQuestion } from "@interviewiq/shared";

export const SUGGESTED_ANSWERS_SCHEMA_DESCRIPTION = jsonSchemaBlock(`
{
  "summary": string,
  "answers": [
    {
      "question": string,     // must exactly match one of the provided questions
      "answer": string,       // a confident, executive-toned model answer; STAR-style for behavioral questions
      "groundedIn": string[]  // short phrases naming the specific resume experience/metrics used
    }
  ]
}
`);

export function buildSuggestedAnswersPrompt(
  resumeText: string,
  questions: InterviewQuestion[]
): string {
  return `${GROUNDING_INSTRUCTIONS}

${SUGGESTED_ANSWERS_SCHEMA_DESCRIPTION}

TASK: For each interview question below, write a model answer grounded
specifically in the candidate's resume — use real experience, metrics, and
achievements from the resume, not generic advice. Write in a confident,
executive tone. Use STAR structure (Situation, Task, Action, Result) for
behavioral questions. If the resume genuinely lacks material to ground a
strong answer for a given question, say so honestly in the answer rather
than fabricating experience, and note that in "groundedIn" as an empty array.

<resume>
${resumeText}
</resume>

<questions>
${JSON.stringify(questions, null, 2)}
</questions>`;
}
