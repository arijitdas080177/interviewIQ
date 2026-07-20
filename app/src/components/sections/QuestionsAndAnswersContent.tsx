import { View, Text } from "react-native";
import type { QuestionAndAnswer } from "@interviewiq/shared";

export function QuestionsAndAnswersContent({ items }: { items: QuestionAndAnswer[] }) {
  return (
    <View>
      {items.map((qa, i) => (
        <View key={i} className="mb-6">
          <View className="bg-navy-100 dark:bg-navy-700 rounded-full self-start px-2 py-0.5 mb-1.5">
            <Text className="text-xs font-medium text-navy-600 dark:text-navy-200">
              {qa.category}
            </Text>
          </View>
          <Text className="text-base font-semibold text-navy-900 dark:text-white mb-2">
            {qa.question}
          </Text>
          {qa.sampleAnswer
            .split(/\n{2,}/)
            .filter((p) => p.trim().length > 0)
            .map((para, pi) => (
              <Text key={pi} className="text-sm text-navy-700 dark:text-navy-100 leading-5 mb-2">
                {para.trim()}
              </Text>
            ))}
          {qa.mentalModel.length ? (
            <View className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-3 mt-1">
              <Text className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-1 uppercase tracking-wide">
                Mental model
              </Text>
              {qa.mentalModel.map((point, mi) => (
                <View key={mi} className="flex-row mb-0.5">
                  <Text className="text-navy-300 dark:text-navy-500 mr-2">•</Text>
                  <Text className="flex-1 text-sm text-navy-700 dark:text-navy-100">{point}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
