import { View, Text } from "react-native";

export function PreparationTipsContent({ tips }: { tips: string[] }) {
  return (
    <View>
      {tips.map((tip, i) => (
        <View key={i} className="flex-row mb-3">
          <Text className="text-gold-600 dark:text-gold-400 mr-2 font-semibold">{i + 1}.</Text>
          <Text className="flex-1 text-sm text-navy-700 dark:text-navy-100 leading-5">{tip}</Text>
        </View>
      ))}
    </View>
  );
}
