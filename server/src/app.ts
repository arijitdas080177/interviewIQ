import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/routes.js";
import { documentsRouter } from "./modules/documents/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/documents", documentsRouter);

  app.use(errorHandler);

  return app;
}
