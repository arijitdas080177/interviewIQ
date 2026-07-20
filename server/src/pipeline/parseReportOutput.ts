import type { PrepReportSections, QuestionAndAnswer, QuestionToAsk } from "@interviewiq/shared";

function extractTag(text: string, tag: string): string | null {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : null;
}

function splitBullets(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^[\s]*[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function parseQuestionsAndAnswers(block: string): QuestionAndAnswer[] {
  const entries: QuestionAndAnswer[] = [];
  const pattern =
    /<question_category>([\s\S]*?)<\/question_category>\s*<question>([\s\S]*?)<\/question>\s*<sample_answer>([\s\S]*?)<\/sample_answer>\s*<mental_model>([\s\S]*?)<\/mental_model>/gi;
  for (const match of block.matchAll(pattern)) {
    entries.push({
      category: match[1].trim(),
      question: match[2].trim(),
      sampleAnswer: match[3].trim(),
      mentalModel: splitBullets(match[4]),
    });
  }
  return entries;
}

function parseQuestionsToAsk(block: string): QuestionToAsk[] {
  const entries: QuestionToAsk[] = [];
  const pattern = /<question>([\s\S]*?)<\/question>\s*<rationale>([\s\S]*?)<\/rationale>/gi;
  for (const match of block.matchAll(pattern)) {
    entries.push({ question: match[1].trim(), rationale: match[2].trim() });
  }
  return entries;
}

/**
 * Parses the tag-delimited plain-text output of the single full-report
 * prompt (server/src/pipeline/prompts/fullReport.ts) into structured
 * sections. This is deliberately not JSON — the prompt is written for
 * natural-language generation with custom tags, which local/smaller models
 * produce far more reliably than schema-perfect JSON for long, prose-heavy
 * output like this.
 */
export function parseReportOutput(rawText: string): PrepReportSections {
  const sections: PrepReportSections = {};

  const companyResearch = extractTag(rawText, "company_research");
  if (companyResearch) sections.companyResearch = companyResearch;

  const interviewerResearch = extractTag(rawText, "interviewer_research");
  if (interviewerResearch) sections.interviewerResearch = interviewerResearch;

  const qaBlock = extractTag(rawText, "interview_questions_and_answers");
  if (qaBlock) {
    const qas = parseQuestionsAndAnswers(qaBlock);
    if (qas.length) sections.interviewQuestionsAndAnswers = qas;
  }

  const questionsToAskBlock = extractTag(rawText, "questions_to_ask");
  if (questionsToAskBlock) {
    const questions = parseQuestionsToAsk(questionsToAskBlock);
    if (questions.length) sections.questionsToAsk = questions;
  }

  const prepTipsBlock = extractTag(rawText, "preparation_tips");
  if (prepTipsBlock) {
    const tips = splitBullets(prepTipsBlock);
    if (tips.length) sections.preparationTips = tips;
  }

  return sections;
}
