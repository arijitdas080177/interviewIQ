import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { documents } from "../../db/schema.js";
import type { DocumentSource, DocumentType } from "@interviewiq/shared";
import { HttpError } from "../../middleware/errorHandler.js";

interface CreateDocumentInput {
  userId: string;
  type: DocumentType;
  source: DocumentSource;
  rawText: string;
  originalFilename?: string | null;
  mimeType?: string | null;
}

export async function createDocument(input: CreateDocumentInput) {
  const trimmed = input.rawText.trim();
  if (!trimmed) {
    throw new HttpError(400, "Document text is empty after parsing");
  }
  const [doc] = await db
    .insert(documents)
    .values({
      userId: input.userId,
      type: input.type,
      source: input.source,
      rawText: trimmed,
      originalFilename: input.originalFilename ?? null,
      mimeType: input.mimeType ?? null,
    })
    .returning();
  return doc;
}

export async function getDocument(id: string, userId: string) {
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc || doc.userId !== userId) {
    throw new HttpError(404, "Document not found");
  }
  return doc;
}
