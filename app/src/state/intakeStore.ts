import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DocumentSource, DocumentType } from "@interviewiq/shared";

export type IntakeStep = "resume" | "job-description" | "interviewer-profile" | "interviewer-role";

export const INTAKE_STEPS: IntakeStep[] = [
  "resume",
  "job-description",
  "interviewer-profile",
  "interviewer-role",
];

export type InputMode = "upload" | "paste" | "linkedin_url";

interface StepInput {
  mode: InputMode;
  text: string; // pasted text, LinkedIn URL, or (for uploads) empty once a documentId exists
  documentId: string | null;
  fileName: string | null;
}

const emptyStepInput: StepInput = { mode: "paste", text: "", documentId: null, fileName: null };

interface IntakeState {
  resume: StepInput;
  jobDescription: StepInput;
  interviewerProfile: StepInput;
  interviewerProfileSkipped: boolean;
  interviewerRole: string;
  hasHydrated: boolean;

  setHasHydrated: (hydrated: boolean) => void;
  setStepMode: (step: "resume" | "jobDescription" | "interviewerProfile", mode: InputMode) => void;
  setStepText: (step: "resume" | "jobDescription" | "interviewerProfile", text: string) => void;
  setStepDocument: (
    step: "resume" | "jobDescription" | "interviewerProfile",
    documentId: string,
    fileName: string
  ) => void;
  setInterviewerSkipped: (skipped: boolean) => void;
  setInterviewerRole: (role: string) => void;
  reset: () => void;
}

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
      resume: { ...emptyStepInput },
      jobDescription: { ...emptyStepInput },
      interviewerProfile: { ...emptyStepInput },
      interviewerProfileSkipped: false,
      interviewerRole: "",
      hasHydrated: false,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      setStepMode: (step, mode) =>
        set((s) => ({ [step]: { ...s[step], mode, documentId: null, fileName: null, text: "" } })),

      setStepText: (step, text) =>
        set((s) => {
          // Guard against a no-op text update (e.g. a controlled TextInput
          // re-firing onChangeText with its current value on mount/re-render)
          // incorrectly invalidating an already-saved document.
          if (s[step].text === text) return s;
          return { [step]: { ...s[step], text, documentId: null, fileName: null } };
        }),

      setStepDocument: (step, documentId, fileName) =>
        // Keep `text` as-is for paste/LinkedIn modes so navigating back still
        // shows what was entered — only upload mode relies on `fileName`
        // instead of `text` for its saved-state display.
        set((s) => ({ [step]: { ...s[step], documentId, fileName } })),

      setInterviewerSkipped: (skipped) => set({ interviewerProfileSkipped: skipped }),
      setInterviewerRole: (role) => set({ interviewerRole: role }),

      reset: () =>
        set({
          resume: { ...emptyStepInput },
          jobDescription: { ...emptyStepInput },
          interviewerProfile: { ...emptyStepInput },
          interviewerProfileSkipped: false,
          interviewerRole: "",
        }),
    }),
    {
      name: "interviewiq-intake",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { hasHydrated: _hasHydrated, ...persisted } = state;
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function stepInputToDocumentSource(mode: InputMode): DocumentSource {
  return mode;
}

export function stepDocumentType(step: "resume" | "jobDescription" | "interviewerProfile"): DocumentType {
  if (step === "resume") return "resume";
  if (step === "jobDescription") return "job_description";
  return "interviewer_profile";
}

/**
 * The furthest step the user has already completed data for, so a cold
 * app restart resumes where they left off instead of always landing back
 * on step 1.
 */
export function furthestIncompleteStep(state: IntakeState): IntakeStep {
  if (!state.resume.documentId) return "resume";
  if (!state.jobDescription.documentId) return "job-description";
  if (!state.interviewerProfile.documentId && !state.interviewerProfileSkipped) {
    return "interviewer-profile";
  }
  return "interviewer-role";
}

export function intakeStepRoute(step: IntakeStep): string {
  return `/(intake)/${step}`;
}
