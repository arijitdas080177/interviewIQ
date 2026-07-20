import { Router } from "express";
import { z } from "zod";
import { authMiddleware, type AuthedRequest } from "../../middleware/auth.js";
import * as reportsService from "./service.js";
import * as shareService from "../share/service.js";
import { renderReportPdf } from "../export/pdf.js";
import { subscribeToReportStream } from "../../pipeline/reportStream.js";

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

reportsRouter.get("/:id/stream", async (req: AuthedRequest, res, next) => {
  try {
    const report = await reportsService.getReport(req.params.id, req.userId!);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    function sendEvent(event: string, data: unknown) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }

    if (report.status === "completed") {
      sendEvent("done", { sections: report.sections });
      res.end();
      return;
    }
    if (report.status === "failed") {
      sendEvent("error", { message: report.errorMessage ?? "Report generation failed." });
      res.end();
      return;
    }

    const { initialBuffer, unsubscribe } = subscribeToReportStream(req.params.id, {
      onChunk: (text) => sendEvent("chunk", { text }),
      onReset: () => sendEvent("reset", {}),
      onDone: (sections) => {
        sendEvent("done", { sections });
        res.end();
      },
      onError: (message) => {
        sendEvent("error", { message });
        res.end();
      },
    });

    if (initialBuffer) sendEvent("chunk", { text: initialBuffer });

    req.on("close", unsubscribe);
  } catch (err) {
    next(err);
  }
});

const createShareLinkSchema = z.object({
  expiresInHours: z.number().positive().optional(),
});

reportsRouter.post("/:id/share", async (req: AuthedRequest, res, next) => {
  try {
    const { expiresInHours } = createShareLinkSchema.parse(req.body ?? {});
    const link = await shareService.createShareLink(req.params.id, req.userId!, expiresInHours);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

reportsRouter.get("/:id/export/pdf", async (req: AuthedRequest, res, next) => {
  try {
    const report = await reportsService.getReport(req.params.id, req.userId!);
    const pdfBuffer = await renderReportPdf(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="interviewiq-report.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});
