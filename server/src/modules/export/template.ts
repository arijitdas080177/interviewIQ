import { SECTION_KEYS, SECTION_TITLES } from "@interviewiq/shared";
import type {
  PrepReportSections,
  QuestionAndAnswer,
  QuestionToAsk,
  SectionKey,
} from "@interviewiq/shared";

export interface ReportForExport {
  interviewerRole: string | null;
  sections: PrepReportSections;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderProse(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para.trim())}</p>`)
    .join("");
}

function renderQuestionsAndAnswers(items: QuestionAndAnswer[]): string {
  return items
    .map(
      (qa) => `
      <div class="detail">
        <span class="tag">${escapeHtml(qa.category)}</span>
        <h3>${escapeHtml(qa.question)}</h3>
        ${renderProse(qa.sampleAnswer)}
        <ul>${qa.mentalModel.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");
}

function renderQuestionsToAsk(items: QuestionToAsk[]): string {
  return items
    .map(
      (q) => `
      <div class="detail">
        <h3>${escapeHtml(q.question)}</h3>
        <p>${escapeHtml(q.rationale)}</p>
      </div>`
    )
    .join("");
}

function renderPreparationTips(tips: string[]): string {
  return `<ul>${tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>`;
}

function renderSectionBody(key: SectionKey, sections: PrepReportSections): string {
  switch (key) {
    case "companyResearch":
      return sections.companyResearch ? renderProse(sections.companyResearch) : "";
    case "interviewerResearch":
      return sections.interviewerResearch ? renderProse(sections.interviewerResearch) : "";
    case "interviewQuestionsAndAnswers":
      return sections.interviewQuestionsAndAnswers
        ? renderQuestionsAndAnswers(sections.interviewQuestionsAndAnswers)
        : "";
    case "questionsToAsk":
      return sections.questionsToAsk ? renderQuestionsToAsk(sections.questionsToAsk) : "";
    case "preparationTips":
      return sections.preparationTips ? renderPreparationTips(sections.preparationTips) : "";
    default:
      return "";
  }
}

export function buildReportHtml(report: ReportForExport): string {
  const sections = SECTION_KEYS.filter((key) => report.sections[key])
    .map(
      (key) => `
      <section>
        <h2>${escapeHtml(SECTION_TITLES[key])}</h2>
        ${renderSectionBody(key, report.sections)}
      </section>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 28mm 22mm; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #0b1220; line-height: 1.5; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .subtitle { color: #3d5580; font-size: 12px; margin-bottom: 24px; }
  section { page-break-inside: avoid; margin-bottom: 28px; }
  h2 { font-size: 18px; border-bottom: 2px solid #1f2f4d; padding-bottom: 6px; margin-bottom: 12px; color: #1f2f4d; }
  h3 { font-size: 14px; margin-bottom: 4px; }
  p { font-size: 12px; margin: 0 0 8px; }
  .detail { margin-bottom: 20px; }
  ul { margin: 0 0 8px; padding-left: 18px; }
  li { font-size: 12px; margin-bottom: 4px; }
  .tag { font-size: 10px; text-transform: uppercase; color: #a9843a; }
</style>
</head>
<body>
  <h1>InterviewIQ Prep Report</h1>
  <div class="subtitle">Interviewer role: ${escapeHtml(report.interviewerRole ?? "Not specified")}</div>
  ${sections}
</body>
</html>`;
}
