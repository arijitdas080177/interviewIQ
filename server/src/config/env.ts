import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  publicBaseUrl: required("PUBLIC_BASE_URL", "http://localhost:4000"),
  llmProvider: (process.env.LLM_PROVIDER ?? "anthropic") as "anthropic" | "openai" | "ollama",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
  tavilyApiKey: process.env.TAVILY_API_KEY,
};
