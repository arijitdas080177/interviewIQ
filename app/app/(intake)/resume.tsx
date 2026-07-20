import { IntakeStepScreen } from "../../src/components/IntakeStepScreen";

export default function ResumeScreen() {
  return (
    <IntakeStepScreen
      step="resume"
      storeKey="resume"
      title="Let's start with your resume"
      prompt="Upload it or paste it in — we'll use it to ground every answer in your real experience."
      pastePlaceholder="Paste your resume text here..."
      nextRoute="/(intake)/job-description"
    />
  );
}
