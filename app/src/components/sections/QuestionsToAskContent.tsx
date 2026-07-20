import { View, Text } from "react-native";
import type { QuestionToAsk } from "@interviewiq/shared";

export function QuestionsToAskContent({ items }: { items: QuestionToAsk[] }) {
  return (
    <View>
      {items.map((q, i) => (
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
