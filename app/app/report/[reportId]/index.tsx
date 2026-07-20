import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Share, LayoutChangeEvent } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SECTION_KEYS,
  SECTION_TITLES,
  type PrepReportDTO,
  type SectionKey,
} from "@interviewiq/shared";
import { api, ApiError } from "../../../src/api/client";
import { AccordionSection } from "../../../src/components/AccordionSection";
import { ResearchSectionContent } from "../../../src/components/sections/ResearchSectionContent";
import { RoleFitContent } from "../../../src/components/sections/RoleFitContent";
import { LikelyQuestionsContent } from "../../../src/components/sections/LikelyQuestionsContent";
import { SuggestedAnswersContent } from "../../../src/components/sections/SuggestedAnswersContent";
import { QuestionsToAskContent } from "../../../src/components/sections/QuestionsToAskContent";
import { PrimaryButton } from "../../../src/components/PrimaryButton";

function previewFor(report: PrepReportDTO, key: SectionKey): string {
  const section = report.sections[key];
  if (!section) return "";
  return "summary" in section ? section.summary : "";
}

export default function ReportScreen() {
  const { reportId, section: deepLinkSection } = useLocalSearchParams<{
    reportId: string;
    section?: string;
  }>();
  const router = useRouter();
  const [report, setReport] = useState<PrepReportDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<SectionKey, number>>>({});
  const hasScrolledToDeepLink = useRef(false);

  useEffect(() => {
    if (!reportId) return;
    api
      .getReport(reportId)
      .then(setReport)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this report.")
      );
  }, [reportId]);

  function handleSectionLayout(key: SectionKey) {
    return (e: LayoutChangeEvent) => {
      sectionOffsets.current[key] = e.nativeEvent.layout.y;
      if (
        !hasScrolledToDeepLink.current &&
        deepLinkSection === key &&
        sectionOffsets.current[key] !== undefined
      ) {
        hasScrolledToDeepLink.current = true;
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: Math.max(0, sectionOffsets.current[key]! - 12), animated: true });
        });
      }
    };
  }

  async function handleShare() {
    if (!report) return;
    try {
      const { url } = await api.createShareLink(report.id);
      await Share.share({ message: url, url });
    } catch (err) {
      // Share link isn't implemented server-side yet (Milestone 7) — the
      // native share sheet for the raw report is still useful in the
      // meantime, so fail quietly here rather than blocking the UI.
      console.warn("Share link unavailable:", err);
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
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-navy-900 dark:text-white" accessibilityRole="header">
          Your prep report
        </Text>
        <PrimaryButton label="Share" onPress={handleShare} variant="secondary" />
      </View>

      <ScrollView ref={scrollRef} className="flex-1 px-6 pt-2" contentContainerStyle={{ paddingBottom: 40 }}>
        {SECTION_KEYS.map((key, index) => {
          const sectionData = report.sections[key];
          if (!sectionData) return null;
          return (
            <View key={key} onLayout={handleSectionLayout(key)}>
              <AccordionSection
                id={key}
                title={SECTION_TITLES[key]}
                preview={previewFor(report, key)}
                defaultExpanded={deepLinkSection ? deepLinkSection === key : index === 0}
              >
                {renderSectionContent(key, report)}
              </AccordionSection>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function renderSectionContent(key: SectionKey, report: PrepReportDTO) {
  const section = report.sections[key];
  if (!section) return null;
  switch (key) {
    case "companyResearch":
    case "interviewerResearch":
      return <ResearchSectionContent section={section as any} />;
    case "roleFitAnalysis":
      return <RoleFitContent section={section as any} />;
    case "likelyQuestions":
      return <LikelyQuestionsContent section={section as any} />;
    case "suggestedAnswers":
      return <SuggestedAnswersContent section={section as any} />;
    case "questionsToAsk":
      return <QuestionsToAskContent section={section as any} />;
    default:
      return null;
  }
}
