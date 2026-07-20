// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@anthropic-ai/sdk",
              message:
                "Import vendor LLM SDKs only inside src/llm/providers/** — pipeline code must depend on the LLMProvider interface (src/llm/types.ts).",
            },
            {
              name: "openai",
              message:
                "Import vendor LLM SDKs only inside src/llm/providers/** — pipeline code must depend on the LLMProvider interface (src/llm/types.ts).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/llm/providers/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  }
);
