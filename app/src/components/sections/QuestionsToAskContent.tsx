import { View, Text } from "react-native";
import type { QuestionsToAskSection } from "@interviewiq/shared";

export function QuestionsToAskContent({ section }: { section: QuestionsToAskSection }) {
  return (
    <View>
      {section.questions.map((q, i) => (
        <View key={i} className="mb-4">
          <Text className="text-base font-semibold text-navy-900 dark:text-white mb-1">
            {q.question}
          </Text>
          <Text className="text-sm text-navy-500 dark:text-navy-300">{q.rationale}</Text>
        </View>
      ))}
    </View>
  );
}
