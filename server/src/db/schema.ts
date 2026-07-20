import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const documentTypeEnum = pgEnum("document_type", [
  "resume",
  "job_description",
  "interviewer_profile",
]);

export const documentSourceEnum = pgEnum("document_source", [
  "upload",
  "paste",
  "linkedin_url",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "processing",
  "completed",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  source: documentSourceEnum("source").notNull(),
  rawText: text("raw_text").notNull(),
  originalFilename: text("original_filename"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const prepReports = pgTable("prep_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resumeDocumentId: uuid("resume_document_id").references(() => documents.id),
  jobDescriptionDocumentId: uuid("job_description_document_id").references(
    () => documents.id
  ),
  interviewerProfileDocumentId: uuid("interviewer_profile_document_id").references(
    () => documents.id
  ),
  interviewerProfileSkipped: boolean("interviewer_profile_skipped")
    .default(false)
    .notNull(),
  interviewerRole: text("interviewer_role"),
  status: reportStatusEnum("status").default("draft").notNull(),
  sections: jsonb("sections").$type<Record<string, unknown>>().default({}).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shareAccessEnum = pgEnum("share_access", ["view_only"]);

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => prepReports.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  access: shareAccessEnum("access").default("view_only").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
