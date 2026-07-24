"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type SSEEvent, streamSSE } from "@/lib/sseClient";
import { type FormState, type UserProfile } from "@/lib/prompt";
import { useAuth } from "./components/AuthProvider";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";

const API_URL = "/api/cover-letter";
const PROFILE_URL = "/api/user-profile";

const DEFAULT_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  experienceSummary: "",
  keySkills: "",
  jobDescription: "",
  formality: 7,
  friendliness: 5,
};

function applyProfile(form: FormState, profile: UserProfile): FormState {
  return {
    ...form,
    fullName: profile.fullName || form.fullName,
    email: profile.email || form.email,
    phone: profile.phone || form.phone,
    experienceSummary: profile.experienceSummary || form.experienceSummary,
    keySkills: profile.keySkills || form.keySkills,
  };
}

export default function CoverLetterPanel() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    fetch(PROFILE_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: UserProfile | null) => {
        if (
          data &&
          (data.fullName ||
            data.email ||
            data.phone ||
            data.experienceSummary ||
            data.keySkills)
        ) {
          setForm((prev) => applyProfile(prev, data));
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []);

  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const abortRef = useRef<AbortController | null>(null);

  const handleEvent = useCallback((ev: SSEEvent) => {
    switch (ev.type) {
      case "chunk":
        setOutput((prev) => prev + ev.text);
        break;
      case "status":
        setStatus(ev.message);
        break;
      case "done":
        setStreaming(false);
        setStatus(null);
        break;
      case "error":
        setError(ev.message);
        setStreaming(false);
        setStatus(null);
        break;
      case "aborted":
        setStreaming(false);
        setStatus("Cancelled.");
        break;
      case "completed":
        break;
    }
  }, []);

  const onSubmit = useCallback(async () => {
    setError(null);
    setStatus("Generating…");
    setOutput("");
    setStreaming(true);
    setCopied(false);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamSSE(API_URL, form, {
        onEvent: handleEvent,
        signal: controller.signal,
      });
      setStreaming((s) => (s ? false : s));
      setStatus((s) => (s === "Generating…" ? null : s));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("Cancelled.");
      } else {
        setError("Network error — is the backend running?");
      }
      setStreaming(false);
    }
  }, [form, handleEvent]);

  const onStop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setStatus("Cancelled.");
  }, []);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [output]);

  const handleChange = useCallback(
    (field: keyof FormState, value: string | number) => {
      setForm((prev: FormState) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setSaveStatus("saving");
    const success = await updateProfile({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      experienceSummary: form.experienceSummary,
      keySkills: form.keySkills,
    });
    setSaveStatus(success ? "saved" : "error");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, [user, form, updateProfile]);

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Cover Letter Generator
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter your profile and a job description, then generate a tailored
          cover letter in seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <InputPanel
          form={form}
          onChange={handleChange}
          onSubmit={onSubmit}
          onStop={onStop}
          streaming={streaming}
          isAuthenticated={!!user}
          onSaveProfile={handleSaveProfile}
          saveStatus={saveStatus}
        />
        <OutputPanel
          output={output}
          streaming={streaming}
          status={status}
          error={error}
          copied={copied}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}
