import { eq } from "drizzle-orm";
import type { PrepReportSections } from "@interviewiq/shared";
import { db } from "../db/client.js";
import { prepReports } from "../db/schema.js";
import { getLLMProvider } from "../llm/index.js";
import type { LLMProvider } from "../llm/types.js";
import { buildFullReportPrompt } from "./prompts/fullReport.js";
import { parseReportOutput } from "./parseReportOutput.js";
import { publishChunk, publishDone, publishError, publishReset } from "./reportStream.js";

interface RunPipelineInput {
  reportId: string;
  resumeText: string;
  jobDescriptionText: string;
  interviewerProfileText: string | null;
  interviewerProfileSkipped: boolean;
  interviewerRole: string;
}

const SYSTEM_PROMPT =
  "You are a precise, thorough executive interview preparation coach. Follow the requested tag " +
  "format exactly — every section must appear inside its named tag, and the " +
  "<interview_questions_and_answers> and <questions_to_ask> sections must use the exact " +
  "per-item tag structure requested, repeated once per item.";

function isSufficient(sections: PrepReportSections): boolean {
  return Boolean(
    sections.companyResearch &&
      sections.interviewerResearch &&
      sections.interviewQuestionsAndAnswers?.length &&
      sections.questionsToAsk?.length &&
      sections.preparationTips?.length
  );
}

async function streamGeneration(
  provider: LLMProvider,
  reportId: string,
  prompt: string,
  retryNote?: string
): Promise<PrepReportSections> {
  let rawText = "";
  for await (const delta of provider.generateTextStream({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: retryNote ? `${prompt}\n\n${retryNote}` : prompt }],
    // This single prompt asks for 10-15 full Q&A pairs (each a 2-4
    // paragraph model answer plus a mental model) on top of the research
    // and prep-tips sections — that's routinely 9000+ output tokens, so
    // the old per-section budget (8192) was truncating generation before
    // the later tags ever appeared.
    maxTokens: 16000,
  })) {
    rawText += delta;
    publishChunk(reportId, delta);
  }
  return parseReportOutput(rawText);
}

export async function runPipeline(input: RunPipelineInput): Promise<void> {
  const provider = getLLMProvider();

  try {
    await db
      .update(prepReports)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(prepReports.id, input.reportId));

    const prompt = buildFullReportPrompt(input);

    let sections = await streamGeneration(provider, input.reportId, prompt);
    if (!isSufficient(sections)) {
      // A single retry with an explicit nudge — smaller/local models
      // occasionally drop a tag or merge sections; this is the same
      // one-retry allowance the old per-section JSON path used. Signal a
      // reset so subscribers discard the incomplete first attempt's text.
      publishReset(input.reportId);
      sections = await streamGeneration(
        provider,
        input.reportId,
        prompt,
        "IMPORTANT: your previous response was missing one or more required tagged sections. " +
          "Make sure your response includes exactly one each of <company_research>, " +
          "<interviewer_research>, <interview_questions_and_answers>, <questions_to_ask>, and " +
          "<preparation_tips>, with the per-item tags inside <interview_questions_and_answers> " +
          "and <questions_to_ask> repeated once per item as specified."
      );
    }

    await db
      .update(prepReports)
      .set({
        sections: sections as Record<string, unknown>,
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(prepReports.id, input.reportId));

    publishDone(input.reportId, sections);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(prepReports)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(prepReports.id, input.reportId));
    publishError(input.reportId, message);
    throw err;
  }
}
