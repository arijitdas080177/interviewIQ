import { create } from "zustand";
import type { PrepReportDTO } from "@interviewiq/shared";

interface ReportState {
  report: PrepReportDTO | null;
  setReport: (report: PrepReportDTO) => void;
  clear: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  report: null,
  setReport: (report) => set({ report }),
  clear: () => set({ report: null }),
}));
