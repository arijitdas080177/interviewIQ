import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { prepReports, shareLinks } from "../../db/schema.js";
import { env } from "../../config/env.js";
import { HttpError } from "../../middleware/errorHandler.js";
import * as reportsService from "../reports/service.js";

export async function createShareLink(
  reportId: string,
  userId: string,
  expiresInHours?: number
) {
  // Ensures the report exists and belongs to this user before sharing it.
  await reportsService.getReport(reportId, userId);

  const token = crypto.randomBytes(24).toString("base64url");
  const expiresAt = expiresInHours
    ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    : null;

  const [link] = await db
    .insert(shareLinks)
    .values({ reportId, token, expiresAt })
    .returning();

  return {
    token: link.token,
    url: `${env.publicBaseUrl}/share/${link.token}`,
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
  };
}

export async function getReportByShareToken(token: string) {
  const link = await db.query.shareLinks.findFirst({
    where: and(eq(shareLinks.token, token), isNull(shareLinks.revokedAt)),
  });
  if (!link) {
    throw new HttpError(404, "This share link is invalid or has been revoked");
  }
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    throw new HttpError(410, "This share link has expired");
  }

  const report = await db.query.prepReports.findFirst({
    where: eq(prepReports.id, link.reportId),
  });
  if (!report) {
    throw new HttpError(404, "Report not found");
  }
  return report;
}
