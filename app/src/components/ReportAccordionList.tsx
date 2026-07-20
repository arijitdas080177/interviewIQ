import { useRef } from "react";
import { ScrollView, View, type LayoutChangeEvent } from "react-native";
import { SECTION_KEYS, SECTION_TITLES, type PrepReportDTO, type SectionKey } from "@interviewiq/shared";
import { AccordionSection } from "./AccordionSection";
import { ProseSectionContent } from "./sections/ProseSectionContent";
import { QuestionsAndAnswersContent } from "./sections/QuestionsAndAnswersContent";
import { QuestionsToAskContent } from "./sections/QuestionsToAskContent";
import { PreparationTipsContent } from "./sections/PreparationTipsContent";

function previewFor(report: PrepReportDTO, key: SectionKey): string {
  const sections = report.sections;
  switch (key) {
    case "companyResearch":
      return sections.companyResearch ?? "";
    case "interviewerResearch":
      return sections.interviewerResearch ?? "";
    case "interviewQuestionsAndAnswers":
      return sections.interviewQuestionsAndAnswers
        ? `${sections.interviewQuestionsAndAnswers.length} questions with model answers`
        : "";
    case "questionsToAsk":
      return sections.questionsToAsk ? `${sections.questionsToAsk.length} questions to ask` : "";
    case "preparationTips":
      return sections.preparationTips?.[0] ?? "";
    default:
      return "";
  }
}

function renderSectionContent(key: SectionKey, report: PrepReportDTO) {
  const sections = report.sections;
  switch (key) {
    case "companyResearch":
      return sections.companyResearch ? (
        <ProseSectionContent text={sections.companyResearch} />
      ) : null;
    case "interviewerResearch":
      return sections.interviewerResearch ? (
        <ProseSectionContent text={sections.interviewerResearch} />
      ) : null;
    case "interviewQuestionsAndAnswers":
      return sections.interviewQuestionsAndAnswers ? (
        <QuestionsAndAnswersContent items={sections.interviewQuestionsAndAnswers} />
      ) : null;
    case "questionsToAsk":
      return sections.questionsToAsk ? (
        <QuestionsToAskContent items={sections.questionsToAsk} />
      ) : null;
    case "preparationTips":
      return sections.preparationTips ? (
        <PreparationTipsContent tips={sections.preparationTips} />
      ) : null;
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
