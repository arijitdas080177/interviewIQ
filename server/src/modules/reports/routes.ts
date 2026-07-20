import { Router } from "express";
import { z } from "zod";
import { authMiddleware, type AuthedRequest } from "../../middleware/auth.js";
import * as reportsService from "./service.js";

export const reportsRouter = Router();
reportsRouter.use(authMiddleware);

const createReportSchema = z.object({
  resumeDocumentId: z.string().uuid(),
  jobDescriptionDocumentId: z.string().uuid(),
  interviewerProfileDocumentId: z.string().uuid().nullable().optional(),
  interviewerProfileSkipped: z.boolean().default(false),
  interviewerRole: z.string().min(1),
});

reportsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const input = createReportSchema.parse(req.body);
    const report = await reportsService.createReport({ userId: req.userId!, ...input });
    res.status(202).json(report);
  } catch (err) {
    next(err);
  }
});

reportsRouter.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const report = await reportsService.getReport(req.params.id, req.userId!);
    res.json(report);
  } catch (err) {
    next(err);
  }
});
