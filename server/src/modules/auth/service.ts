import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { env } from "../../config/env.js";
import { HttpError } from "../../middleware/errorHandler.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

export async function signup(email: string, password: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [user] = await db.insert(users).values({ email, passwordHash }).returning();
  return { token: issueToken(user.id), user: { id: user.id, email: user.email } };
}

export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Invalid email or password");
  }
  return { token: issueToken(user.id), user: { id: user.id, email: user.email } };
}
