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

export interface QuestionAndAnswer {
  category: string;
  question: string;
  sampleAnswer: string;
  mentalModel: string[];
}

export interface QuestionToAsk {
  question: string;
  rationale: string;
}

export interface PrepReportSections {
  companyResearch?: string;
  interviewerResearch?: string;
  interviewQuestionsAndAnswers?: QuestionAndAnswer[];
  questionsToAsk?: QuestionToAsk[];
  preparationTips?: string[];
}

export const SECTION_KEYS = [
  "companyResearch",
  "interviewerResearch",
  "interviewQuestionsAndAnswers",
  "questionsToAsk",
  "preparationTips",
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
