export interface FormState {
  fullName: string;
  email: string;
  phone: string;
  experienceSummary: string;
  keySkills: string;
  jobDescription: string;
  formality: number;
  friendliness: number;
}

export function buildSystemPrompt(data: FormState): string {
  const formalityLabel = data.formality <= 3 ? "Casual" : data.formality <= 7 ? "Balanced" : "Formal";
  const warmthLabel = data.friendliness <= 3 ? "Direct" : data.friendliness <= 7 ? "Polite" : "Warm";

  const contactParts = [data.email, data.phone].filter((part) => part.trim().length > 0);
  const contactLine = contactParts.length > 0 ? contactParts.join("  ") : "Not provided";

  return [
    "You are a senior career-coach and cover-letter specialist. Write ONE professional cover letter tailored exactly to the job description and candidate profile below.",
    "",
    "Context",
    `Candidate name: ${data.fullName || "Candidate"}`,
    `Contact: ${contactLine}`,
    `Experience summary: ${data.experienceSummary || "Not provided"}`,
    `Key skills: ${data.keySkills || "Not provided"}`,
    "",
    "Job description",
    data.jobDescription || "Not provided",
    "",
    "Output rules",
    "- Write ONLY the cover letter. No preamble, no headings, no explanations, no quotes around the output.",
    "- Length: 250–400 words. Dense but conversational.",
    "- Structure: hook + value proposition paragraph + closing paragraph.",
    "- Mention candidate by name once early. Mirror exact keywords from the job description (title, team, tech stack, metrics).",
    "- Turn the experience summary into 1–2 concrete achievement sentences (prefer numbers and outcomes). Do not invent details; rephrase what the candidate wrote.",
    `- Match tone: formality ${data.formality}/10 → ${formalityLabel}, warmth ${data.friendliness}/10 → ${warmthLabel}.`,
    "- End with a single closing sentence expressing eagerness to discuss the role.",
    "- No generic placeholders like \"[Company]\". Do not close with \"Sincerely, [name]\". The letter should be the body only.",
    "- If any field above is missing, still write a strong letter using only what is provided.",
  ].join("\n");
}
