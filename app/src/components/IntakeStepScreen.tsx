import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { IntakeLayout } from "./IntakeLayout";
import { InputModeToggle } from "./InputModeToggle";
import { PasteTextArea } from "./PasteTextArea";
import { FileUploadCard } from "./FileUploadCard";
import { SkipButton } from "./SkipButton";
import { PrimaryButton } from "./PrimaryButton";
import {
  useIntakeStore,
  stepDocumentType,
  type IntakeStep,
} from "../state/intakeStore";
import { api, ApiError } from "../api/client";

type StoreStepKey = "resume" | "jobDescription" | "interviewerProfile";

interface IntakeStepScreenProps {
  step: IntakeStep;
  storeKey: StoreStepKey;
  title: string;
  prompt: string;
  pastePlaceholder: string;
  includeLinkedIn?: boolean;
  allowSkip?: boolean;
  nextRoute: string;
}

export function IntakeStepScreen({
  step,
  storeKey,
  title,
  prompt,
  pastePlaceholder,
  includeLinkedIn,
  allowSkip,
  nextRoute,
}: IntakeStepScreenProps) {
  const router = useRouter();
  const stepInput = useIntakeStore((s) => s[storeKey]);
  const setStepMode = useIntakeStore((s) => s.setStepMode);
  const setStepText = useIntakeStore((s) => s.setStepText);
  const setStepDocument = useIntakeStore((s) => s.setStepDocument);
  const setInterviewerSkipped = useIntakeStore((s) => s.setInterviewerSkipped);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docType = stepDocumentType(storeKey);

  async function ensureDocumentSaved(): Promise<string | null> {
    if (stepInput.documentId) return stepInput.documentId;
    if (!stepInput.text.trim()) return null;
    const source = stepInput.mode === "linkedin_url" ? "linkedin_url" : "paste";
    const doc = await api.pasteDocument(docType, stepInput.text.trim(), source);
    setStepDocument(storeKey, doc.id, doc.originalFilename ?? "Pasted text");
    return doc.id;
  }

  async function handleNext() {
    setError(null);

    if (allowSkip && stepInput.mode !== "upload" && !stepInput.text.trim() && !stepInput.documentId) {
      // No input given on a skippable step — treat as an explicit skip only
      // via the Skip button, so require input here.
      setError("Add the interviewer's profile, or tap skip below.");
      return;
    }

    if (stepInput.mode === "upload" && !stepInput.documentId) {
      setError("Please upload a file to continue.");
      return;
    }
    if (stepInput.mode !== "upload" && !stepInput.text.trim()) {
      setError("Please enter some text to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await ensureDocumentSaved();
      if (storeKey === "interviewerProfile") setInterviewerSkipped(false);
      router.push(nextRoute as never);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    setInterviewerSkipped(true);
    router.push(nextRoute as never);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <IntakeLayout step={step} title={title} prompt={prompt}>
        <InputModeToggle
          value={stepInput.mode}
          onChange={(mode) => setStepMode(storeKey, mode)}
          includeLinkedIn={includeLinkedIn}
        />

        {stepInput.mode === "upload" ? (
          <FileUploadCard
            fileName={stepInput.fileName}
            onPicked={async (file) => {
              const doc = await api.uploadDocument(docType, file);
              setStepDocument(storeKey, doc.id, file.name);
            }}
          />
        ) : (
          <PasteTextArea
            value={stepInput.text}
            onChangeText={(text) => setStepText(storeKey, text)}
            placeholder={
              stepInput.mode === "linkedin_url"
                ? "https://www.linkedin.com/in/..."
                : pastePlaceholder
            }
            accessibilityLabel={title}
          />
        )}

        {error ? (
          <Text className="text-red-600 dark:text-red-300 text-sm mt-3" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <View className="flex-1" />

        <PrimaryButton label="Continue" onPress={handleNext} loading={submitting} />
        {allowSkip ? <SkipButton onPress={handleSkip} /> : null}
      </IntakeLayout>
    </KeyboardAvoidingView>
  );
}
