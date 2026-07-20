import type {
  AuthResponseDTO,
  DocumentDTO,
  DocumentSource,
  DocumentType,
  PrepReportDTO,
  ShareLinkDTO,
} from "@interviewiq/shared";
import { getToken } from "./authToken";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; formData?: FormData } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body) headers["Content-Type"] = "application/json";

  if (options.auth !== false) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.formData ?? (options.body ? JSON.stringify(options.body) : undefined),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? `Request failed with ${response.status}`);
  }
  return data as T;
}

export const api = {
  signup: (email: string, password: string) =>
    request<AuthResponseDTO>("/auth/signup", { method: "POST", body: { email, password }, auth: false }),

  login: (email: string, password: string) =>
    request<AuthResponseDTO>("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  pasteDocument: (type: DocumentType, text: string, source: DocumentSource = "paste") =>
    request<DocumentDTO>("/documents/paste", { method: "POST", body: { type, text, source } }),

  uploadDocument: async (
    type: DocumentType,
    file: { uri: string; name: string; mimeType: string }
  ): Promise<DocumentDTO> => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
    return request<DocumentDTO>("/documents/upload", { method: "POST", formData });
  },

  createReport: (input: {
    resumeDocumentId: string;
    jobDescriptionDocumentId: string;
    interviewerProfileDocumentId?: string | null;
    interviewerProfileSkipped: boolean;
    interviewerRole: string;
  }) => request<PrepReportDTO>("/reports", { method: "POST", body: input }),

  getReport: (id: string) => request<PrepReportDTO>(`/reports/${id}`),

  createShareLink: (reportId: string, expiresInHours?: number) =>
    request<ShareLinkDTO>(`/reports/${reportId}/share`, {
      method: "POST",
      body: expiresInHours ? { expiresInHours } : {},
    }),

  getSharedReport: (token: string) =>
    request<PrepReportDTO>(`/share/${token}`, { auth: false }),
};
