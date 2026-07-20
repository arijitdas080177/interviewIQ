export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Citation {
  url: string;
  title?: string;
  snippet?: string;
}

export interface GenerateOptions {
  system?: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface WebSearchTool {
  /** Marks that the model may use web search to ground its answer in live sources. */
  type: "web_search";
  maxUses?: number;
}

export interface GenerateWithToolsOptions extends GenerateOptions {
  tools: WebSearchTool[];
}

export interface LLMResult {
  text: string;
  citations: Citation[];
  raw?: unknown;
}

export interface WebSearchResult {
  url: string;
  title: string;
  snippet: string;
}

/**
 * Provider-agnostic LLM interface. Pipeline code (server/src/pipeline/**)
 * must only depend on this interface, never on a vendor SDK type directly —
 * that's what lets LLM_PROVIDER swap providers with no pipeline changes.
 */
export interface LLMProvider {
  readonly name: string;

  /** Plain text generation, no tool use (e.g. reasoning purely over supplied resume/JD text). */
  generateText(opts: GenerateOptions): Promise<LLMResult>;

  /** Text generation with tool access (currently: web search) for grounded research. */
  generateWithTools(opts: GenerateWithToolsOptions): Promise<LLMResult>;

  /**
   * Same as generateText, but yields text deltas as they're generated
   * instead of waiting for the full response — lets callers surface partial
   * output live (e.g. over SSE) instead of a single multi-minute wait,
   * especially valuable for slower local models.
   */
  generateTextStream(opts: GenerateOptions): AsyncGenerator<string, void, unknown>;
}
