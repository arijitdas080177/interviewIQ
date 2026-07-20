import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";

async function main() {
  const migrationClient = postgres(env.databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await migrationClient.end();
  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
