import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { MAX_UPLOAD_BYTES, SUPPORTED_UPLOAD_MIME_TYPES } from "@interviewiq/shared";
import { authMiddleware, type AuthedRequest } from "../../middleware/auth.js";
import { HttpError } from "../../middleware/errorHandler.js";
import { parseDocument } from "./parser.js";
import * as documentsService from "./service.js";

export const documentsRouter = Router();
documentsRouter.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const documentTypeSchema = z.enum(["resume", "job_description", "interviewer_profile"]);

const pasteSchema = z.object({
  type: documentTypeSchema,
  text: z.string().min(1, "Text is required"),
  source: z.enum(["paste", "linkedin_url"]).default("paste"),
});

documentsRouter.post("/upload", upload.single("file"), async (req: AuthedRequest, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new HttpError(400, "No file uploaded (expected form field 'file')");
    }
    if (!SUPPORTED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      throw new HttpError(415, `Unsupported file type: ${file.mimetype}`);
    }
    const type = documentTypeSchema.parse(req.body.type);
    const rawText = await parseDocument(file.buffer, file.mimetype);
    const doc = await documentsService.createDocument({
      userId: req.userId!,
      type,
      source: "upload",
      rawText,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

documentsRouter.post("/paste", async (req: AuthedRequest, res, next) => {
  try {
    const { type, text, source } = pasteSchema.parse(req.body);
    const doc = await documentsService.createDocument({
      userId: req.userId!,
      type,
      source,
      rawText: text,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

documentsRouter.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const doc = await documentsService.getDocument(req.params.id, req.userId!);
    res.json(doc);
  } catch (err) {
    next(err);
  }
});
