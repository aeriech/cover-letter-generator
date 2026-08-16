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
  isAuthenticated: boolean;
  onSaveProfile: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export default function InputPanel({
  form,
  onChange,
  onSubmit,
  onStop,
  streaming,
  isAuthenticated,
  onSaveProfile,
  saveStatus,
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
    "w-full rounded-lg border border-border bg-panel-2 text-sm text-text outline-none transition-all duration-200 placeholder:text-muted/70 disabled:opacity-60";

  const fieldFilled =
    "border-border focus:border-accent focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_0_4px_rgba(79,70,229,0.08)]";
  const fieldEmpty =
    "border-amber-400 focus:border-amber-500 focus:ring-amber-200/40";
  const fieldFilledNoRing =
    "border-border";

  const reqClass = (filled: boolean) =>
    `${fieldBase} ${filled ? fieldFilled : fieldEmpty}`;

  return (
    <div className="rounded-xl border border-border bg-panel p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold text-text-secondary tracking-wide uppercase"
            htmlFor="fullName"
          >
            Full name <span className="text-warning">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            disabled={disabled}
            onChange={(e) => onChange("fullName", e.target.value)}
            className={`${reqClass(hasName)} p-2.5`}
            placeholder="Jordan Smith"
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold text-text-secondary tracking-wide uppercase"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            disabled={disabled}
            onChange={(e) => onChange("email", e.target.value)}
            className={`${fieldBase} ${fieldFilled} p-2.5`}
            placeholder="jordan@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold text-text-secondary tracking-wide uppercase"
            htmlFor="phone"
          >
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            disabled={disabled}
            onChange={(e) => onChange("phone", e.target.value)}
            className={`${fieldBase} ${fieldFilled} p-2.5`}
            placeholder="+1 (555) 0123"
          />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <label
          className="block text-xs font-semibold text-text-secondary tracking-wide uppercase"
          htmlFor="experienceSummary"
        >
          Experience summary <span className="text-warning">*</span>
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

      <div className="mt-5 space-y-1.5">
        <label
          className="block text-xs font-semibold text-text-secondary tracking-wide uppercase"
          htmlFor="keySkills"
        >
          Key skills
        </label>
        <textarea
          id="keySkills"
          value={form.keySkills}
          disabled={disabled}
          onChange={(e) => onChange("keySkills", e.target.value)}
          className={`${fieldBase} ${fieldFilled} min-h-[80px] resize-y p-3 leading-relaxed`}
          placeholder="e.g. React, TypeScript, Next.js, Node.js, PostgreSQL, team leadership"
        />
      </div>

      <div className="mt-5 space-y-1.5">
        <label
          className="block text-xs font-semibold text-text-secondary tracking-wide uppercase"
          htmlFor="jobDescription"
        >
          Job description <span className="text-warning">*</span>
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

      <div className="mt-6 space-y-5">
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:border-border disabled:bg-panel-2 disabled:text-muted disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
        >
          Generate cover letter
        </button>
        {streaming && (
          <button
            onClick={onStop}
            className="w-full rounded-lg border border-danger/30 bg-danger-bg px-5 py-2.5 text-sm font-semibold text-danger transition-all duration-200 ease-out hover:bg-danger/10 active:scale-[0.98] sm:w-auto"
          >
            Stop
          </button>
        )}
        {isAuthenticated && !streaming && (
          <button
            onClick={onSaveProfile}
            disabled={saveStatus === "saving"}
            className="rounded-lg border border-border bg-panel-2 px-5 py-2.5 text-sm font-medium text-text transition-all duration-200 ease-out hover:bg-panel-3 hover:border-border-strong active:scale-[0.98] disabled:opacity-60"
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Saved!"
                : saveStatus === "error"
                  ? "Save failed"
                  : "Save profile"}
          </button>
        )}
        {!canSubmit && !streaming && missingFields.length > 0 && (
          <p className="w-full text-xs font-medium text-warning text-center sm:text-left">
            Fill in {missingFields.join(", ")} to enable generation.
          </p>
        )}
      </div>
    </div>
  );
}
