"use client";

import ToneSlider from "./ToneSlider";

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

interface InputPanelProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string | number) => void;
  onSubmit: () => void;
  onStop: () => void;
  streaming: boolean;
}

export default function InputPanel({
  form,
  onChange,
  onSubmit,
  onStop,
  streaming,
}: InputPanelProps) {
  const disabled = streaming;

  const hasName = form.fullName.trim().length > 0;
  const hasSummary = form.experienceSummary.trim().length > 0;
  const hasJobDesc = form.jobDescription.trim().length > 0;

  const canSubmit = hasName && hasSummary && hasJobDesc && !streaming;

  const missingFields: string[] = [];
  if (!hasName) missingFields.push("Full name");
  if (!hasSummary) missingFields.push("Experience summary");
  if (!hasJobDesc) missingFields.push("Job description");

  const fieldBase =
    "w-full rounded-xl border bg-panel-2 text-sm text-text outline-none transition-all placeholder:text-muted/70 disabled:opacity-60";

  const fieldFilled = "border-border focus:border-accent focus:ring-2 focus:ring-accent/30";
  const fieldEmpty  = "border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40";

  const reqClass = (filled: boolean) => `${fieldBase} ${filled ? fieldFilled : fieldEmpty}`;

  return (
    <div className="rounded-2xl border border-border bg-panel p-5 shadow-sm transition-colors">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted" htmlFor="fullName">
            Full name <span className="text-amber-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            disabled={disabled}
            onChange={(e) => onChange("fullName", e.target.value)}
            className={reqClass(hasName)}
            placeholder="Jordan Smith"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            disabled={disabled}
            onChange={(e) => onChange("email", e.target.value)}
            className={`${fieldBase} ${fieldFilled}`}
            placeholder="jordan@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            disabled={disabled}
            onChange={(e) => onChange("phone", e.target.value)}
            className={`${fieldBase} ${fieldFilled}`}
            placeholder="+1 (555) 0123"
          />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <label className="block text-xs font-semibold text-muted" htmlFor="experienceSummary">
          Experience summary <span className="text-amber-500">*</span>
        </label>
        <textarea
          id="experienceSummary"
          value={form.experienceSummary}
          disabled={disabled}
          onChange={(e) => onChange("experienceSummary", e.target.value)}
          className={`${reqClass(hasSummary)} min-h-[140px] resize-y p-3 leading-relaxed`}
          placeholder="e.g. 4 years building full-stack apps with React and Node.js. Led a team of 5 to ship an internal tool that reduced onboarding time by 30%."
        />
      </div>

      <div className="mt-4 space-y-1">
        <label className="block text-xs font-semibold text-muted" htmlFor="keySkills">
          Key skills
        </label>
        <textarea
          id="keySkills"
          value={form.keySkills}
          disabled={disabled}
          onChange={(e) => onChange("keySkills", e.target.value)}
          className="w-full min-h-[80px] resize-y rounded-xl border border-border bg-panel-2 p-3 text-sm text-text leading-relaxed outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
          placeholder="e.g. React, TypeScript, Next.js, Node.js, PostgreSQL, team leadership"
        />
      </div>

      <div className="mt-4 space-y-1">
        <label className="block text-xs font-semibold text-muted" htmlFor="jobDescription">
          Job description <span className="text-amber-500">*</span>
        </label>
        <textarea
          id="jobDescription"
          value={form.jobDescription}
          disabled={disabled}
          onChange={(e) => onChange("jobDescription", e.target.value)}
          className={`${reqClass(hasJobDesc)} min-h-[180px] resize-y p-3 leading-relaxed`}
          placeholder="Paste the job description here. Include title, responsibilities, tech stack, and required qualifications for best results."
        />
      </div>

      <div className="mt-5 space-y-5">
        <ToneSlider
          label="Formality"
          value={form.formality}
          onChange={(v) => onChange("formality", v)}
          disabled={disabled}
          lowLabel="Casual"
          midLabel="Balanced"
          highLabel="Formal"
        />
        <ToneSlider
          label="Friendliness"
          value={form.friendliness}
          onChange={(v) => onChange("friendliness", v)}
          disabled={disabled}
          lowLabel="Direct"
          midLabel="Polite"
          highLabel="Warm"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl border border-accent/30 bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-border disabled:bg-panel-2 disabled:text-muted disabled:hover:brightness-100 sm:w-auto"
        >
          Generate cover letter
        </button>
        {streaming && (
          <button
            onClick={onStop}
            className="w-full rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-all hover:bg-danger/20 active:scale-[0.98] sm:w-auto"
          >
            Stop
          </button>
        )}
        {!canSubmit && !streaming && missingFields.length > 0 && (
          <p className="w-full text-xs font-medium text-amber-600 text-center sm:text-left">
            Fill in {missingFields.join(", ")} to enable generation.
          </p>
        )}
      </div>
    </div>
  );
}
