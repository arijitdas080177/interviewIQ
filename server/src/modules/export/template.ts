import { SECTION_KEYS, SECTION_TITLES } from "@interviewiq/shared";
import type {
  LikelyQuestionsSection,
  PrepReportSections,
  QuestionsToAskSection,
  ResearchSection,
  RoleFitSection,
  SectionClaim,
  SectionDetail,
  SectionKey,
  SuggestedAnswersSection,
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

function renderClaim(claim: SectionClaim): string {
  const inference = claim.confidence === "inference";
  const citations = claim.citations?.length
    ? `<div class="citation">${claim.citations.map((c) => escapeHtml(c.title ?? c.url)).join(" · ")}</div>`
    : "";
  return `<li class="${inference ? "inference" : ""}">${escapeHtml(claim.text)}${
    inference ? ' <span class="tag">(inferred)</span>' : ""
  }${citations}</li>`;
}

function renderDetail(detail: SectionDetail): string {
  return `
    <div class="detail">
      <h3>${escapeHtml(detail.heading)}</h3>
      <p>${escapeHtml(detail.body)}</p>
      <ul>${detail.claims.map(renderClaim).join("")}</ul>
    </div>`;
}

function renderResearchSection(section: ResearchSection): string {
  return `<p class="summary">${escapeHtml(section.summary)}</p>${section.details.map(renderDetail).join("")}`;
}

function renderRoleFitSection(section: RoleFitSection): string {
  return `
    <p class="summary">${escapeHtml(section.summary)}</p>
    <h4>Strong matches</h4>
    ${section.strongMatches.map(renderDetail).join("")}
    <h4>Potential gaps</h4>
    ${section.potentialGaps.map(renderDetail).join("")}`;
}

function renderLikelyQuestions(section: LikelyQuestionsSection): string {
  return `
    <p class="summary">${escapeHtml(section.summary)}</p>
    ${section.questions
      .map(
        (q) => `
      <div class="detail">
        <span class="tag">${escapeHtml(q.category)}</span>
        <h3>${escapeHtml(q.question)}</h3>
        <p>${escapeHtml(q.rationale)}</p>
      </div>`
      )
      .join("")}`;
}

function renderSuggestedAnswers(section: SuggestedAnswersSection): string {
  return `
    <p class="summary">${escapeHtml(section.summary)}</p>
    ${section.answers
      .map(
        (a) => `
      <div class="detail">
        <h3>${escapeHtml(a.question)}</h3>
        <p>${escapeHtml(a.answer)}</p>
        ${a.groundedIn.length ? `<div class="citation">Grounded in: ${a.groundedIn.map(escapeHtml).join(", ")}</div>` : ""}
      </div>`
      )
      .join("")}`;
}

function renderQuestionsToAsk(section: QuestionsToAskSection): string {
  return `
    <p class="summary">${escapeHtml(section.summary)}</p>
    ${section.questions
      .map(
        (q) => `
      <div class="detail">
        <h3>${escapeHtml(q.question)}</h3>
        <p>${escapeHtml(q.rationale)}</p>
      </div>`
      )
      .join("")}`;
}

function renderSectionBody(key: SectionKey, report: ReportForExport): string {
  const section = report.sections[key];
  if (!section) return "";
  switch (key) {
    case "companyResearch":
    case "interviewerResearch":
      return renderResearchSection(section as ResearchSection);
    case "roleFitAnalysis":
      return renderRoleFitSection(section as RoleFitSection);
    case "likelyQuestions":
      return renderLikelyQuestions(section as LikelyQuestionsSection);
    case "suggestedAnswers":
      return renderSuggestedAnswers(section as SuggestedAnswersSection);
    case "questionsToAsk":
      return renderQuestionsToAsk(section as QuestionsToAskSection);
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
        ${renderSectionBody(key, report)}
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
  h4 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #3d5580; margin: 16px 0 8px; }
  p { font-size: 12px; margin: 0 0 8px; }
  .summary { font-size: 13px; font-style: italic; color: #3d5580; margin-bottom: 16px; }
  .detail { margin-bottom: 16px; }
  ul { margin: 0 0 8px; padding-left: 18px; }
  li { font-size: 12px; margin-bottom: 4px; }
  li.inference { font-style: italic; color: #6b7280; }
  .tag { font-size: 10px; text-transform: uppercase; color: #a9843a; }
  .citation { font-size: 10px; color: #a9843a; margin-top: 2px; }
</style>
</head>
<body>
  <h1>InterviewIQ Prep Report</h1>
  <div class="subtitle">Interviewer role: ${escapeHtml(report.interviewerRole ?? "Not specified")}</div>
  ${sections}
</body>
</html>`;
}
