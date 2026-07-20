import { IntakeStepScreen } from "../../src/components/IntakeStepScreen";

export default function JobDescriptionScreen() {
  return (
    <IntakeStepScreen
      step="job-description"
      storeKey="jobDescription"
      title="Now, the job description"
      prompt="Upload the posting or paste it in — this shapes the company research and the questions we generate."
      pastePlaceholder="Paste the job description here..."
      nextRoute="/(intake)/interviewer-profile"
    />
  );
}
