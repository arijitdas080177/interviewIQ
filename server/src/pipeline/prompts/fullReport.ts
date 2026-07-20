export function buildFullReportPrompt(input: {
  resumeText: string;
  jobDescriptionText: string;
  interviewerProfileText: string | null;
  interviewerProfileSkipped: boolean;
  interviewerRole: string;
}): string {
  const interviewerProfile = input.interviewerProfileSkipped || !input.interviewerProfileText
    ? "Not provided — the candidate does not yet know who will be interviewing them. Reason generically about what someone in the stated role would care about, and note explicitly that this is inference rather than research on a specific person."
    : input.interviewerProfileText;

  return `You will be acting as an executive interview preparation coach. Your task is to help a candidate prepare for an executive-level interview by providing comprehensive research, likely interview questions, sample answers grounded in their experience, and strategic questions they should ask.

Here is the candidate's resume:
<resume>
${input.resumeText}
</resume>

Here is the job description for the position they're interviewing for:
<job_description>
${input.jobDescriptionText}
</job_description>

Here is the profile/background of the person who will be interviewing them:
<interviewee_profile>
${interviewerProfile}
</interviewee_profile>

Here is the current role the interviewer holds:
<interviewee_role>
${input.interviewerRole}
</interviewee_role>

Your task is to create a comprehensive interview preparation guide. Before generating your final output, use the scratchpad to plan your approach.

<scratchpad>
In your scratchpad, think through:
1. What is the seniority level of the position based on the job description?
2. What are the key requirements and competencies needed for this role?
3. What experiences from the resume are most relevant to this position?
4. Given the interviewer's role and profile, what would they likely care most about?
5. What types of questions would someone in the interviewer's role typically ask?
6. What question categories should be covered (behavioral, situational, strategic, technical, culture fit)?
</scratchpad>

Now, create a comprehensive interview preparation guide with the following sections:

<company_research>
Provide relevant research about the company based on information available in the job description. Include:
- Company overview and industry context
- Key business priorities or challenges (if mentioned or implied in the job description)
- Company culture indicators from the job description
- How this role fits into the broader organization
</company_research>

<interviewer_research>
Provide an analysis of the interviewer based on their profile and role. Include:
- Their background and career trajectory
- Their likely priorities and concerns given their role
- What they would value in a candidate for this position
- Their perspective on the role being hired for
- Potential areas of focus during the interview
</interviewer_research>

<interview_questions_and_answers>
Generate 10-15 interview questions that this interviewer would likely ask, organized by category. For each question, provide:

1. The question itself
2. A detailed sample answer (2-4 paragraphs) that is:
- Grounded entirely in actual experiences from the candidate's resume
- Written in an executive leadership tone with appropriate gravitas
- Demonstrates strategic thinking and leadership qualities
- Shows empathy, emotional intelligence, and human connection where appropriate
- Uses executive language and frameworks naturally
3. A "Mental Model/Key Points" section with 3-5 bullet points that capture the essence of the answer for easy recall

Question categories to include:
- Behavioral questions (past experiences and accomplishments)
- Situational questions (hypothetical scenarios)
- Strategic questions (vision, planning, decision-making)
- Technical/Functional questions (specific to the role's domain)
- Culture fit and leadership philosophy questions

Important guidelines:
- Questions should reflect the seniority level of the position
- Questions should align with what someone in the interviewer's role would care about
- DO NOT fabricate experiences - only use what's actually in the resume
- If the resume lacks certain experiences, acknowledge this in your answer and pivot to related experiences
- Answers should sound natural and conversational, not scripted
- Include specific metrics, outcomes, and impacts where available from the resume

Format each question-answer pair as:
<question_category>Category Name</question_category>
<question>The interview question</question>
<sample_answer>
Your detailed answer here, grounded in resume content...
</sample_answer>
<mental_model>
- Key point 1 to remember
- Key point 2 to remember
- Key point 3 to remember
</mental_model>
</interview_questions_and_answers>

<questions_to_ask>
Provide 5-10 thoughtful questions the candidate should ask the interviewer at the end of the interview. These questions should:
- Be appropriate for the interviewer's role and level
- Demonstrate strategic thinking and genuine interest
- Help the candidate assess if this opportunity is right for them
- Show understanding of the business and role
- Avoid questions that could easily be answered through basic research

For each question, briefly explain (1-2 sentences) why this is a good question to ask this particular interviewer.

Format as:
<question>The question to ask</question>
<rationale>Why this question is valuable for this interviewer</rationale>
</questions_to_ask>

<preparation_tips>
Provide 3-5 specific tips for succeeding in this interview based on:
- The interviewer's role and likely priorities
- The seniority of the position
- Key themes from the job description
- The candidate's background and how to best position it
</preparation_tips>

Remember: All content must be realistic, practical, and grounded in the actual information provided. Your goal is to help the candidate feel genuinely prepared and confident for this specific interview.`;
}
