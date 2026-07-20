import { IntakeStepScreen } from "../../src/components/IntakeStepScreen";

export default function InterviewerProfileScreen() {
  return (
    <IntakeStepScreen
      step="interviewer-profile"
      storeKey="interviewerProfile"
      title="Who's interviewing you?"
      prompt="Paste their LinkedIn URL, a bio, or upload something — or skip if you don't know yet."
      pastePlaceholder="Paste their bio or profile text here..."
      includeLinkedIn
      allowSkip
      nextRoute="/(intake)/interviewer-role"
    />
  );
}
