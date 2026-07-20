import { View, Text } from "react-native";
import type { SectionDetail } from "@interviewiq/shared";
import { ClaimText } from "./ClaimText";

export function DetailBlock({ detail }: { detail: SectionDetail }) {
  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-navy-900 dark:text-white mb-1">
        {detail.heading}
      </Text>
      <Text className="text-sm text-navy-600 dark:text-navy-200 mb-2">{detail.body}</Text>
      {detail.claims.map((claim, i) => (
        <ClaimText key={i} claim={claim} />
      ))}
    </View>
  );
}
