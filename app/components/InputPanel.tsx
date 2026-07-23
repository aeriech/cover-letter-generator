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
  disabled: boolean;
  onSubmit: () => void;
  onStop: () => void;
  streaming: boolean;
}

export default function InputPanel({
  form,
  onChange,
  disabled,
  onSubmit,
  onStop,
  streaming,
}: InputPanelProps) {
  const canSubmit =
    form.fullName.trim().length > 0 &&
    form.experienceSummary.trim().length > 0 &&
    form.jobDescription.trim().length > 0 &&
    !streaming;

  return (
    <div className="rounded-2xl border border-border bg-panel p-5 shadow-sm transition-colors">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            disabled={disabled}
            onChange={(e) => onChange("fullName", e.target.value)}
            className="w-full rounded-xl border border-border bg-panel-2 px-3 py-2 text-sm text-text outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
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
            className="w-full rounded-xl border border-border bg-panel-2 px-3 py-2 text-sm text-text outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
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
            className="w-full rounded-xl border border-border bg-panel-2 px-3 py-2 text-sm text-text outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
            placeholder="+1 (555) 0123"
          />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <label className="block text-xs font-semibold text-muted" htmlFor="experienceSummary">
          Experience summary
        </label>
        <textarea
          id="experienceSummary"
          value={form.experienceSummary}
          disabled={disabled}
          onChange={(e) => onChange("experienceSummary", e.target.value)}
          className="w-full min-h-[140px] resize-y rounded-xl border border-border bg-panel-2 p-3 text-sm text-text leading-relaxed outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
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
          Job description
        </label>
        <textarea
          id="jobDescription"
          value={form.jobDescription}
          disabled={disabled}
          onChange={(e) => onChange("jobDescription", e.target.value)}
          className="w-full min-h-[180px] resize-y rounded-xl border border-border bg-panel-2 p-3 text-sm text-text leading-relaxed outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
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

      <div className="mt-5">
        {!streaming ? (
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 sm:w-auto"
          >
            Generate cover letter
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-all hover:bg-danger/20 active:scale-[0.98] sm:w-auto"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
