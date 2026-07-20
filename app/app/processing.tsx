import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";

// Placeholder for Milestone 5 verification — full polling + progress UI
// lands in Milestone 6.
export default function ProcessingScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-navy-900 px-6">
      <ActivityIndicator size="large" />
      <Text className="text-navy-900 dark:text-white text-base mt-4 text-center">
        Preparing your report...
      </Text>
      <Text className="text-navy-400 dark:text-navy-300 text-xs mt-2">{reportId}</Text>
    </View>
  );
}
