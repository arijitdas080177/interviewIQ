import Anthropic from "@anthropic-ai/sdk";
import type {
  Citation,
  GenerateOptions,
  GenerateWithToolsOptions,
  LLMProvider,
  LLMResult,
} from "../types.js";

const DEFAULT_MODEL = "claude-sonnet-5";
const DEFAULT_MAX_TOKENS = 4096;

function extractTextAndCitations(content: unknown[]): LLMResult {
  let text = "";
  const citations: Citation[] = [];

  for (const block of content) {
    const b = block as {
      type?: string;
      text?: string;
      citations?: { url?: string; title?: string; cited_text?: string }[];
    };
    if (b.type === "text" && typeof b.text === "string") {
      text += b.text;
      for (const c of b.citations ?? []) {
        if (c.url) {
          citations.push({ url: c.url, title: c.title, snippet: c.cited_text });
        }
      }
    }
  }

  return { text: text.trim(), citations };
}

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateText(opts: GenerateOptions): Promise<LLMResult> {
    const response = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: opts.temperature,
      system: opts.system,
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const result = extractTextAndCitations(response.content as unknown[]);
    return { ...result, raw: response };
  }

  async *generateTextStream(opts: GenerateOptions): AsyncGenerator<string, void, unknown> {
    const stream = this.client.messages.stream({
      model: DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: opts.temperature,
      system: opts.system,
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }

  async generateWithTools(opts: GenerateWithToolsOptions): Promise<LLMResult> {
    const hasWebSearch = opts.tools.some((t) => t.type === "web_search");
    const response = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: opts.temperature,
      system: opts.system,
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      tools: hasWebSearch
        ? ([
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: opts.tools.find((t) => t.type === "web_search")?.maxUses ?? 5,
            },
          ] as unknown as Anthropic.Messages.Tool[])
        : undefined,
    });
    const result = extractTextAndCitations(response.content as unknown[]);
    return { ...result, raw: response };
  }
}
