import OpenAI from "openai";
import type {
  Citation,
  GenerateOptions,
  GenerateWithToolsOptions,
  LLMProvider,
  LLMResult,
} from "../types.js";

const DEFAULT_MODEL = "gpt-4o";

function buildInput(opts: GenerateOptions) {
  return opts.messages.map((m) => ({ role: m.role, content: m.content }));
}

function extractTextAndCitations(response: {
  output_text?: string;
  output?: unknown[];
}): LLMResult {
  const text = response.output_text ?? "";
  const citations: Citation[] = [];

  for (const item of response.output ?? []) {
    const i = item as { type?: string; content?: unknown[] };
    if (i.type !== "message") continue;
    for (const c of i.content ?? []) {
      const block = c as { annotations?: { url?: string; title?: string }[] };
      for (const a of block.annotations ?? []) {
        if (a.url) citations.push({ url: a.url, title: a.title });
      }
    }
  }

  return { text: text.trim(), citations };
}

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateText(opts: GenerateOptions): Promise<LLMResult> {
    const response = await this.client.responses.create({
      model: DEFAULT_MODEL,
      instructions: opts.system,
      input: buildInput(opts),
      max_output_tokens: opts.maxTokens,
      temperature: opts.temperature,
    });
    const result = extractTextAndCitations(response);
    return { ...result, raw: response };
  }

  async generateWithTools(opts: GenerateWithToolsOptions): Promise<LLMResult> {
    const hasWebSearch = opts.tools.some((t) => t.type === "web_search");
    const response = await this.client.responses.create({
      model: DEFAULT_MODEL,
      instructions: opts.system,
      input: buildInput(opts),
      max_output_tokens: opts.maxTokens,
      temperature: opts.temperature,
      tools: hasWebSearch ? [{ type: "web_search_preview" }] : undefined,
    });
    const result = extractTextAndCitations(response);
    return { ...result, raw: response };
  }
}
