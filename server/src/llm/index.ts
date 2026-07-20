import { env } from "../config/env.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenAIProvider } from "./providers/openai.js";
import { OllamaProvider } from "./providers/ollama.js";
import type { LLMProvider } from "./types.js";

let cachedProvider: LLMProvider | undefined;

export function getLLMProvider(): LLMProvider {
  if (cachedProvider) return cachedProvider;

  if (env.llmProvider === "openai") {
    if (!env.openaiApiKey) throw new Error("OPENAI_API_KEY is not set");
    cachedProvider = new OpenAIProvider(env.openaiApiKey);
  } else if (env.llmProvider === "ollama") {
    cachedProvider = new OllamaProvider();
  } else {
    if (!env.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    cachedProvider = new AnthropicProvider(env.anthropicApiKey);
  }

  return cachedProvider;
}

export type { LLMProvider } from "./types.js";
