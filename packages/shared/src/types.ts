export type DocumentType = "resume" | "job_description" | "interviewer_profile";

export type DocumentSource = "upload" | "paste" | "linkedin_url";

export interface DocumentDTO {
  id: string;
  type: DocumentType;
  source: DocumentSource;
  rawText: string;
  originalFilename: string | null;
  mimeType: string | null;
  createdAt: string;
}

export type ReportStatus = "draft" | "processing" | "completed" | "failed";

export type ClaimConfidence = "sourced" | "inference";

export interface Citation {
  url: string;
  title?: string;
  snippet?: string;
}

export interface SectionClaim {
  text: string;
  confidence: ClaimConfidence;
  citations?: Citation[];
}

export interface SectionDetail {
  heading: string;
  body: string;
  claims: SectionClaim[];
}

export interface ResearchSection {
  summary: string;
  details: SectionDetail[];
}

export interface RoleFitSection {
  summary: string;
  strongMatches: SectionDetail[];
  potentialGaps: SectionDetail[];
}

export interface InterviewQuestion {
  question: string;
  category: "strategic" | "behavioral" | "technical" | "leadership";
  rationale: string;
}

export interface LikelyQuestionsSection {
  summary: string;
  questions: InterviewQuestion[];
}

export interface SuggestedAnswer {
  question: string;
  answer: string;
  groundedIn: string[];
}

export interface SuggestedAnswersSection {
  summary: string;
  answers: SuggestedAnswer[];
}

export interface QuestionToAsk {
  question: string;
  rationale: string;
}

export interface QuestionsToAskSection {
  summary: string;
  questions: QuestionToAsk[];
}

export interface PrepReportSections {
  companyResearch?: ResearchSection;
  interviewerResearch?: ResearchSection;
  roleFitAnalysis?: RoleFitSection;
  likelyQuestions?: LikelyQuestionsSection;
  suggestedAnswers?: SuggestedAnswersSection;
  questionsToAsk?: QuestionsToAskSection;
}

export const SECTION_KEYS = [
  "companyResearch",
  "interviewerResearch",
  "roleFitAnalysis",
  "likelyQuestions",
  "suggestedAnswers",
  "questionsToAsk",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export interface PrepReportDTO {
  id: string;
  status: ReportStatus;
  interviewerRole: string | null;
  interviewerProfileSkipped: boolean;
  sections: PrepReportSections;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLinkDTO {
  token: string;
  url: string;
  expiresAt: string | null;
}

export interface AuthUserDTO {
  id: string;
  email: string;
}

export interface AuthResponseDTO {
  token: string;
  user: AuthUserDTO;
}
