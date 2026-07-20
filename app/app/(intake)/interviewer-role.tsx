import { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { IntakeLayout } from "../../src/components/IntakeLayout";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useIntakeStore } from "../../src/state/intakeStore";
import { api, ApiError } from "../../src/api/client";

export default function InterviewerRoleScreen() {
  const router = useRouter();
  const store = useIntakeStore();
  const [role, setRole] = useState(store.interviewerRole);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!role.trim()) {
      setError("Enter the interviewer's role or title to continue.");
      return;
    }
    if (!store.resume.documentId || !store.jobDescription.documentId) {
      setError("Missing resume or job description — please go back and complete those steps.");
      return;
    }

    store.setInterviewerRole(role.trim());
    setSubmitting(true);
    try {
      const report = await api.createReport({
        resumeDocumentId: store.resume.documentId,
        jobDescriptionDocumentId: store.jobDescription.documentId,
        interviewerProfileDocumentId: store.interviewerProfile.documentId,
        interviewerProfileSkipped: store.interviewerProfileSkipped,
        interviewerRole: role.trim(),
      });
      router.push({ pathname: "/processing", params: { reportId: report.id } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <IntakeLayout
        step="interviewer-role"
        title="What's their role?"
        prompt="Their current title helps us tailor the tone and focus of your questions (e.g. a CFO probes financial rigor)."
      >
        <TextInput
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Chief Financial Officer"
          placeholderTextColor="#8497b6"
          allowFontScaling
          accessibilityLabel="Interviewer's role or title"
          className="rounded-xl border border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-white p-4 text-base"
        />

        {error ? (
          <Text className="text-red-600 dark:text-red-300 text-sm mt-3" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <View className="flex-1" />

        <PrimaryButton
          label="Generate my prep report"
          onPress={handleSubmit}
          loading={submitting}
        />
      </IntakeLayout>
    </KeyboardAvoidingView>
  );
}
