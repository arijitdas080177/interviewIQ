import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { prepReports } from "../db/schema.js";
import { getLLMProvider } from "../llm/index.js";
import { companyResearch } from "./sections/companyResearch.js";
import { interviewerResearch } from "./sections/interviewerResearch.js";
import { roleFitAnalysis } from "./sections/roleFitAnalysis.js";
import { likelyQuestions } from "./sections/likelyQuestions.js";
import { suggestedAnswers } from "./sections/suggestedAnswers.js";
import { questionsToAsk } from "./sections/questionsToAsk.js";

interface RunPipelineInput {
  reportId: string;
  resumeText: string;
  jobDescriptionText: string;
  interviewerProfileText: string | null;
  interviewerProfileSkipped: boolean;
  interviewerRole: string;
}

async function patchSections(reportId: string, patch: Record<string, unknown>) {
  const existing = await db.query.prepReports.findFirst({
    where: eq(prepReports.id, reportId),
  });
  const merged = { ...(existing?.sections ?? {}), ...patch };
  await db
    .update(prepReports)
    .set({ sections: merged, updatedAt: new Date() })
    .where(eq(prepReports.id, reportId));
}

export async function runPipeline(input: RunPipelineInput): Promise<void> {
  const provider = getLLMProvider();

  try {
    await db
      .update(prepReports)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(prepReports.id, input.reportId));

    // Phase 1: independent research, run concurrently.
    const [companyResult, interviewerResult, roleFitResult] = await Promise.all([
      companyResearch(provider, input.jobDescriptionText),
      interviewerResearch(
        provider,
        input.interviewerProfileText,
        input.interviewerProfileSkipped,
        input.interviewerRole
      ),
      roleFitAnalysis(provider, input.resumeText, input.jobDescriptionText),
    ]);
    await patchSections(input.reportId, {
      companyResearch: companyResult,
      interviewerResearch: interviewerResult,
      roleFitAnalysis: roleFitResult,
    });

    // Phase 2: questions depend on phase 1 outputs.
    const likelyQuestionsResult = await likelyQuestions(
      provider,
      input.jobDescriptionText,
      input.interviewerRole,
      companyResult,
      interviewerResult,
      roleFitResult
    );
    await patchSections(input.reportId, { likelyQuestions: likelyQuestionsResult });

    // Phase 3: answers and questions-to-ask both depend on phase 2, not each other.
    const [suggestedAnswersResult, questionsToAskResult] = await Promise.all([
      suggestedAnswers(provider, input.resumeText, likelyQuestionsResult),
      questionsToAsk(provider, companyResult, interviewerResult, roleFitResult),
    ]);
    await patchSections(input.reportId, {
      suggestedAnswers: suggestedAnswersResult,
      questionsToAsk: questionsToAskResult,
    });

    await db
      .update(prepReports)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(prepReports.id, input.reportId));
  } catch (err) {
    await db
      .update(prepReports)
      .set({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : String(err),
        updatedAt: new Date(),
      })
      .where(eq(prepReports.id, input.reportId));
    throw err;
  }
}
