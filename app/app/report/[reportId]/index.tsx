import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Share, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { PrepReportDTO } from "@interviewiq/shared";
import { api, ApiError, API_URL } from "../../../src/api/client";
import { getToken } from "../../../src/api/authToken";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { ReportAccordionList } from "../../../src/components/ReportAccordionList";

export default function ReportScreen() {
  const { reportId, section: deepLinkSection } = useLocalSearchParams<{
    reportId: string;
    section?: string;
  }>();
  const router = useRouter();
  const [report, setReport] = useState<PrepReportDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    api
      .getReport(reportId)
      .then(setReport)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this report.")
      );
  }, [reportId]);

  async function handleShare() {
    if (!report) return;
    setSharing(true);
    setExportError(null);
    setCopiedLink(null);
    let url: string;
    try {
      const result = await api.createShareLink(report.id);
      url = result.url;
    } catch (err) {
      setExportError(
        err instanceof ApiError ? err.message : "Couldn't create a share link. Please try again."
      );
      setSharing(false);
      return;
    }

    // The link was created successfully at this point — failures below are
    // just about *presenting* it, so they shouldn't be reported as a share
    // link failure.
    try {
      if (Platform.OS === "web") {
        // react-native's Share API has no web implementation.
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setCopiedLink(url);
        }
      } else {
        await Share.share({ message: url, url });
      }
    } catch {
      setCopiedLink(url);
    } finally {
      setSharing(false);
    }
  }

  async function handleExportPdf() {
    if (!report) return;
    setExporting(true);
    setExportError(null);
    try {
      const token = await getToken();
      const exportUrl = `${API_URL}/reports/${report.id}/export/pdf`;

      if (Platform.OS === "web") {
        // expo-file-system's native download API has no web implementation
        // (there's no app-private filesystem in a browser) — fetch the PDF
        // as a blob and let the browser handle the download/open directly.
        const response = await fetch(exportUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error("Export failed. Please try again.");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        // window.open() here gets silently blocked by popup blockers since
        // this fires from an async callback, not a direct click — an
        // <a download> click is treated as a save action, not a popup, so
        // it isn't blocked the same way.
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `interviewiq-report-${report.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        return;
      }

      const dest = `${FileSystem.cacheDirectory}interviewiq-report-${report.id}.pdf`;
      const result = await FileSystem.downloadAsync(exportUrl, dest, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (result.status !== 200) {
        throw new Error("Export failed. Please try again.");
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: "application/pdf" });
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Couldn't export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-navy-900 items-center justify-center px-8">
        <Text className="text-navy-900 dark:text-white text-base font-semibold text-center mb-2">
          Couldn't load report
        </Text>
        <Text className="text-navy-500 dark:text-navy-300 text-sm text-center mb-6">{error}</Text>
        <PrimaryButton label="Back to start" onPress={() => router.replace("/(intake)/resume")} />
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
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-navy-900 dark:text-white" accessibilityRole="header">
            Your prep report
          </Text>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <PrimaryButton label="Share" onPress={handleShare} variant="secondary" loading={sharing} />
          </View>
          <View className="flex-1">
            <PrimaryButton
              label="Export PDF"
              onPress={handleExportPdf}
              variant="secondary"
              loading={exporting}
            />
          </View>
        </View>
        {exportError ? (
          <Text className="text-red-600 dark:text-red-300 text-xs mt-2" accessibilityLiveRegion="polite">
            {exportError}
          </Text>
        ) : null}
        {copiedLink ? (
          <Text
            className="text-navy-500 dark:text-navy-300 text-xs mt-2"
            accessibilityLiveRegion="polite"
            numberOfLines={1}
          >
            Link copied: {copiedLink}
          </Text>
        ) : null}
      </View>

      <ReportAccordionList report={report} deepLinkSection={deepLinkSection} />
    </SafeAreaView>
  );
}
