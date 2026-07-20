import { Router } from "express";
import * as shareService from "./service.js";

export const publicShareRouter = Router();

publicShareRouter.get("/:token", async (req, res, next) => {
  try {
    const report = await shareService.getReportByShareToken(req.params.token);
    res.json(report);
  } catch (err) {
    next(err);
  }
});
