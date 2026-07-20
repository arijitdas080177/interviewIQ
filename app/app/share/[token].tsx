import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PrepReportDTO } from "@interviewiq/shared";
import { api, ApiError } from "../../src/api/client";
import { ReportAccordionList } from "../../src/components/ReportAccordionList";

export default function SharedReportScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [report, setReport] = useState<PrepReportDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getSharedReport(token)
      .then(setReport)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "This share link is invalid, expired, or has been revoked."
        )
      );
  }, [token]);

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-navy-900 items-center justify-center px-8">
        <Text className="text-navy-900 dark:text-white text-base font-semibold text-center mb-2">
          Can't open this report
        </Text>
        <Text className="text-navy-500 dark:text-navy-300 text-sm text-center">{error}</Text>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-navy-900 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-navy-900" edges={["top", "bottom"]}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-navy-900 dark:text-white" accessibilityRole="header">
          Interview prep report
        </Text>
        <View className="self-start bg-navy-100 dark:bg-navy-700 rounded-full px-3 py-1 mt-2">
          <Text className="text-xs font-medium text-navy-600 dark:text-navy-200">View-only</Text>
        </View>
      </View>

      <ReportAccordionList report={report} />
    </SafeAreaView>
  );
}
