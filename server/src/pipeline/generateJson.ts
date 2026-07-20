import type { ZodSchema } from "zod";
import type { LLMProvider, WebSearchTool } from "../llm/types.js";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate.trim());
}

interface GenerateJsonOptions<T> {
  provider: LLMProvider;
  system: string;
  prompt: string;
  schema: ZodSchema<T>;
  tools?: WebSearchTool[];
}

/**
 * Requests structured JSON from the LLM, validates against `schema`, and
 * retries once (with the parse error fed back to the model) on failure.
 */
export async function generateJson<T>(opts: GenerateJsonOptions<T>): Promise<T> {
  const messages = [{ role: "user" as const, content: opts.prompt }];

  const run = async (extraSystem?: string) => {
    const system = extraSystem ? `${opts.system}\n\n${extraSystem}` : opts.system;
    return opts.tools?.length
      ? opts.provider.generateWithTools({ system, messages, tools: opts.tools })
      : opts.provider.generateText({ system, messages });
  };

  const first = await run();
  try {
    return opts.schema.parse(extractJson(first.text));
  } catch (firstError) {
    const retry = await run(
      `Your previous response could not be parsed as valid JSON matching the required schema. ` +
        `Error: ${firstError instanceof Error ? firstError.message : String(firstError)}. ` +
        `Respond with ONLY valid JSON, no prose, no markdown fences.`
    );
    return opts.schema.parse(extractJson(retry.text));
  }
}
