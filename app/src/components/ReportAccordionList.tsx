import { useRef } from "react";
import { ScrollView, View, type LayoutChangeEvent } from "react-native";
import { SECTION_KEYS, SECTION_TITLES, type PrepReportDTO, type SectionKey } from "@interviewiq/shared";
import { AccordionSection } from "./AccordionSection";
import { ResearchSectionContent } from "./sections/ResearchSectionContent";
import { RoleFitContent } from "./sections/RoleFitContent";
import { LikelyQuestionsContent } from "./sections/LikelyQuestionsContent";
import { SuggestedAnswersContent } from "./sections/SuggestedAnswersContent";
import { QuestionsToAskContent } from "./sections/QuestionsToAskContent";

function previewFor(report: PrepReportDTO, key: SectionKey): string {
  const section = report.sections[key];
  if (!section) return "";
  return "summary" in section ? section.summary : "";
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

interface ReportAccordionListProps {
  report: PrepReportDTO;
  deepLinkSection?: string;
}

export function ReportAccordionList({ report, deepLinkSection }: ReportAccordionListProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<SectionKey, number>>>({});
  const hasScrolledToDeepLink = useRef(false);

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
          scrollRef.current?.scrollTo({
            y: Math.max(0, sectionOffsets.current[key]! - 12),
            animated: true,
          });
        });
      }
    };
  }

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 px-6 pt-2"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
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
  );
}
