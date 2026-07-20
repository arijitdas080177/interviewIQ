import { View, Text } from "react-native";
import type { SuggestedAnswersSection } from "@interviewiq/shared";

export function SuggestedAnswersContent({ section }: { section: SuggestedAnswersSection }) {
  return (
    <View>
      {section.answers.map((a, i) => (
        <View key={i} className="mb-6">
          <Text className="text-base font-semibold text-navy-900 dark:text-white mb-1">
            {a.question}
          </Text>
          <Text className="text-sm text-navy-700 dark:text-navy-100 mb-2 leading-5">
            {a.answer}
          </Text>
          {a.groundedIn.length ? (
            <View className="flex-row flex-wrap gap-1.5">
              {a.groundedIn.map((g, gi) => (
                <View key={gi} className="bg-gold-500/10 border border-gold-500/30 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-gold-600 dark:text-gold-400">{g}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-xs italic text-navy-400 dark:text-navy-400">
              No direct resume match — flagged for the candidate to address honestly.
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
