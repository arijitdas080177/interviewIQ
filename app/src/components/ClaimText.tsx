import { View, Text } from "react-native";
import type { SectionClaim } from "@interviewiq/shared";

export function ClaimText({ claim }: { claim: SectionClaim }) {
  const isInference = claim.confidence === "inference";
  return (
    <View className="flex-row mb-1.5">
      <Text className="text-navy-300 dark:text-navy-500 mr-2">•</Text>
      <View className="flex-1">
        <Text
          className={`text-sm ${
            isInference
              ? "italic text-navy-400 dark:text-navy-400"
              : "text-navy-700 dark:text-navy-100"
          }`}
        >
          {claim.text}
          {isInference ? (
            <Text className="text-xs text-navy-300 dark:text-navy-500"> (inferred)</Text>
          ) : null}
        </Text>
        {claim.citations?.length ? (
          <Text
            className="text-xs text-gold-600 dark:text-gold-400 mt-0.5"
            accessibilityLabel={`Sources: ${claim.citations.map((c) => c.title ?? c.url).join(", ")}`}
          >
            {claim.citations.map((c) => c.title ?? c.url).join(" · ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
