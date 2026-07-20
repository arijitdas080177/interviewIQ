import { env } from "../../config/env.js";
import { tavilySearch } from "../search/tavily.js";
import type {
  Citation,
  GenerateOptions,
  GenerateWithToolsOptions,
  LLMProvider,
  LLMResult,
} from "../types.js";

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: { function: { name: string; arguments: Record<string, unknown> } }[];
}

interface OllamaChatResponse {
  message: OllamaMessage;
}

const WEB_SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "web_search",
    description: "Search the web for current, verifiable information.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query." },
      },
      required: ["query"],
    },
  },
};

const MAX_TOOL_ROUNDS = 4;

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";

  private async chat(
    messages: OllamaMessage[],
    opts: {
      maxTokens?: number;
      temperature?: number;
      tools?: (typeof WEB_SEARCH_TOOL)[];
    }
  ): Promise<OllamaChatResponse> {
    const response = await fetch(`${env.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Node's fetch defaults to a 5-minute headers timeout, which a slower
      // local machine can legitimately exceed on a single generation —
      // this isn't a hung request, just slower hardware than a hosted API.
      signal: AbortSignal.timeout(15 * 60 * 1000),
      body: JSON.stringify({
        model: env.ollamaModel,
        messages,
        tools: opts.tools,
        stream: false,
        options: {
          num_predict: opts.maxTokens ?? 4096,
          temperature: opts.temperature,
        },
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Ollama request failed: ${response.status} ${await response.text()}. ` +
          `Is 'ollama serve' running and has '${env.ollamaModel}' been pulled?`
      );
    }
    return (await response.json()) as OllamaChatResponse;
  }

  private toOllamaMessages(opts: GenerateOptions): OllamaMessage[] {
    const messages: OllamaMessage[] = [];
    if (opts.system) messages.push({ role: "system", content: opts.system });
    for (const m of opts.messages) messages.push({ role: m.role, content: m.content });
    return messages;
  }

  async generateText(opts: GenerateOptions): Promise<LLMResult> {
    const response = await this.chat(this.toOllamaMessages(opts), {
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
    });
    return { text: response.message.content.trim(), citations: [], raw: response };
  }

  async *generateTextStream(opts: GenerateOptions): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${env.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15 * 60 * 1000),
      body: JSON.stringify({
        model: env.ollamaModel,
        messages: this.toOllamaMessages(opts),
        stream: true,
        options: {
          num_predict: opts.maxTokens ?? 4096,
          temperature: opts.temperature,
        },
      }),
    });
    if (!response.ok || !response.body) {
      throw new Error(
        `Ollama request failed: ${response.status} ${await response.text()}. ` +
          `Is 'ollama serve' running and has '${env.ollamaModel}' been pulled?`
      );
    }

    // Ollama streams newline-delimited JSON objects, one per token chunk,
    // each shaped like { message: { content: "<delta>" }, done: boolean }.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const chunk = JSON.parse(line) as OllamaChatResponse & { done: boolean };
        if (chunk.message?.content) yield chunk.message.content;
      }
    }
    if (buffer.trim()) {
      const chunk = JSON.parse(buffer) as OllamaChatResponse & { done: boolean };
      if (chunk.message?.content) yield chunk.message.content;
    }
  }

  async generateWithTools(opts: GenerateWithToolsOptions): Promise<LLMResult> {
    const hasWebSearch = opts.tools.some((t) => t.type === "web_search");
    const messages = this.toOllamaMessages(opts);
    const citations: Citation[] = [];

    if (!hasWebSearch) {
      const response = await this.chat(messages, {
        maxTokens: opts.maxTokens,
        temperature: opts.temperature,
      });
      return { text: response.message.content.trim(), citations: [], raw: response };
    }

    let lastResponse: OllamaChatResponse | undefined;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.chat(messages, {
        maxTokens: opts.maxTokens,
        temperature: opts.temperature,
        tools: [WEB_SEARCH_TOOL],
      });
      lastResponse = response;
      const toolCalls = response.message.tool_calls;

      if (!toolCalls?.length) {
        return { text: response.message.content.trim(), citations, raw: response };
      }

      messages.push({ role: "assistant", content: response.message.content, tool_calls: toolCalls });

      for (const call of toolCalls) {
        if (call.function.name !== "web_search") continue;
        const query = String(call.function.arguments.query ?? "");
        try {
          const results = await tavilySearch(query);
          for (const r of results) citations.push({ url: r.url, title: r.title, snippet: r.snippet });
          messages.push({
            role: "tool",
            content: JSON.stringify(
              results.map((r) => ({ title: r.title, url: r.url, snippet: r.snippet }))
            ),
          });
        } catch (err) {
          messages.push({
            role: "tool",
            content: `Search failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }
    }

    // Ran out of tool rounds — return whatever text the last response had
    // rather than failing the whole section outright.
    return { text: lastResponse?.message.content.trim() ?? "", citations, raw: lastResponse };
  }
}
