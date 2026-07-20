import { Router } from "express";
import { z } from "zod";
import * as authService from "./service.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

authRouter.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = credentialsSchema.parse(req.body);
    const result = await authService.signup(email, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = credentialsSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
