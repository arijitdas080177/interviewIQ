import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SECTION_KEYS, SECTION_TITLES, type PrepReportDTO } from "@interviewiq/shared";
import { api, ApiError } from "../src/api/client";
import { PrimaryButton } from "../src/components/PrimaryButton";

const POLL_INTERVAL_MS = 3000;

export default function ProcessingScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<PrepReportDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!reportId) return;

    async function poll() {
      try {
        const result = await api.getReport(reportId);
        setReport(result);
        if (result.status === "completed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace({ pathname: "/report/[reportId]", params: { reportId } });
        } else if (result.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setError(result.errorMessage ?? "Something went wrong generating your report.");
        }
      } catch (err) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setError(err instanceof ApiError ? err.message : "Lost connection. Please try again.");
      }
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reportId, router]);

  const completedCount = report ? Object.keys(report.sections).length : 0;
  const currentLabel = SECTION_KEYS[Math.min(completedCount, SECTION_KEYS.length - 1)];

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-navy-900 px-8">
        <Text className="text-2xl mb-3">⚠️</Text>
        <Text className="text-navy-900 dark:text-white text-base font-semibold text-center mb-2">
          We couldn't finish your report
        </Text>
        <Text className="text-navy-500 dark:text-navy-300 text-sm text-center mb-6">{error}</Text>
        <PrimaryButton label="Back to start" onPress={() => router.replace("/(intake)/resume")} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-navy-900 px-8">
      <ActivityIndicator size="large" />
      <Text
        className="text-navy-900 dark:text-white text-base font-semibold mt-5 text-center"
        accessibilityLiveRegion="polite"
      >
        Preparing your report...
      </Text>
      <Text className="text-navy-400 dark:text-navy-300 text-sm mt-2 text-center">
        {SECTION_TITLES[currentLabel]}
      </Text>
      <View className="flex-row gap-1.5 mt-6">
        {SECTION_KEYS.map((key) => (
          <View
            key={key}
            className={`h-1.5 w-8 rounded-full ${
              report?.sections[key]
                ? "bg-navy-800 dark:bg-gold-500"
                : "bg-navy-100 dark:bg-navy-700"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
