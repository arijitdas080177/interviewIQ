import { View, Text } from "react-native";
import type { LikelyQuestionsSection } from "@interviewiq/shared";

const CATEGORY_LABELS: Record<string, string> = {
  strategic: "Strategic",
  behavioral: "Behavioral",
  technical: "Technical",
  leadership: "Leadership",
};

export function LikelyQuestionsContent({ section }: { section: LikelyQuestionsSection }) {
  return (
    <View>
      {section.questions.map((q, i) => (
        <View key={i} className="mb-5">
          <View className="flex-row items-center mb-1">
            <View className="bg-navy-100 dark:bg-navy-700 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-xs font-medium text-navy-600 dark:text-navy-200">
                {CATEGORY_LABELS[q.category] ?? q.category}
              </Text>
            </View>
          </View>
          <Text className="text-base font-semibold text-navy-900 dark:text-white mb-1">
            {q.question}
          </Text>
          <Text className="text-sm text-navy-500 dark:text-navy-300">{q.rationale}</Text>
        </View>
      ))}
    </View>
  );
}
