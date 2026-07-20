import { env } from "../../config/env.js";
import type { WebSearchResult } from "../types.js";

interface TavilySearchResponse {
  results: { url: string; title: string; content: string }[];
}

/**
 * Web search backend for providers with no built-in search (currently just
 * Ollama) — Anthropic/OpenAI use their own hosted web search tool instead
 * and never call this.
 */
export async function tavilySearch(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  if (!env.tavilyApiKey) {
    throw new Error("TAVILY_API_KEY is not set — required for web search with the ollama provider");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      query,
      max_results: maxResults,
      search_depth: "basic",
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as TavilySearchResponse;
  return data.results.map((r) => ({ url: r.url, title: r.title, snippet: r.content }));
}
