import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { prepReports } from "../../db/schema.js";
import { HttpError } from "../../middleware/errorHandler.js";
import * as documentsService from "../documents/service.js";
import { runPipeline } from "../../pipeline/orchestrator.js";

interface CreateReportInput {
  userId: string;
  resumeDocumentId: string;
  jobDescriptionDocumentId: string;
  interviewerProfileDocumentId?: string | null;
  interviewerProfileSkipped: boolean;
  interviewerRole: string;
}

export async function createReport(input: CreateReportInput) {
  const resumeDoc = await documentsService.getDocument(input.resumeDocumentId, input.userId);
  const jobDescriptionDoc = await documentsService.getDocument(
    input.jobDescriptionDocumentId,
    input.userId
  );
  const interviewerProfileDoc = input.interviewerProfileDocumentId
    ? await documentsService.getDocument(input.interviewerProfileDocumentId, input.userId)
    : null;

  const [report] = await db
    .insert(prepReports)
    .values({
      userId: input.userId,
      resumeDocumentId: resumeDoc.id,
      jobDescriptionDocumentId: jobDescriptionDoc.id,
      interviewerProfileDocumentId: interviewerProfileDoc?.id ?? null,
      interviewerProfileSkipped: input.interviewerProfileSkipped,
      interviewerRole: input.interviewerRole,
      status: "draft",
    })
    .returning();

  // Fire-and-forget: the pipeline runs async and persists partial/final
  // state itself. The client polls GET /reports/:id for status.
  runPipeline({
    reportId: report.id,
    resumeText: resumeDoc.rawText,
    jobDescriptionText: jobDescriptionDoc.rawText,
    interviewerProfileText: interviewerProfileDoc?.rawText ?? null,
    interviewerProfileSkipped: input.interviewerProfileSkipped,
    interviewerRole: input.interviewerRole,
  }).catch((err) => {
    console.error(`Pipeline failed for report ${report.id}:`, err);
  });

  return report;
}

export async function getReport(id: string, userId: string) {
  const report = await db.query.prepReports.findFirst({ where: eq(prepReports.id, id) });
  if (!report || report.userId !== userId) {
    throw new HttpError(404, "Report not found");
  }
  return report;
}
