# Cover Letter Generator

A Next.js web application that generates tailored, professional cover letters from a candidate's profile and a target job description. It streams output directly in the UI using Server-Sent Events and fine-tunes tone and formality via interactive sliders.

## Features

- **Persistent user profile** — Store your name, contact info, summary, and skills in a local JSON file. The form auto-populates on every visit — no more re-typing.
- **Job-description-aware output** — Paste the target role description; the model mirrors keywords, tech stack, and metrics.
- **Tone control** — Adjust formality (Casual → Formal) and friendliness (Direct → Warm) via sliders.
- **Real-time streaming** — Cover letter streams token-by-token as it is generated, with a blinking caret indicator.
- **Stop generation** — Abort an in-flight request at any time.
- **One-click copy** — Copy the finished letter to the clipboard.
- **Model fallback** — Automatically falls back across Gemini 2.5 Flash / Pro / 1.5 Flash models for resilience.

## Prerequisites

- **Node.js** >= 18.17
- **npm** (Node.js package manager)
- A valid **Gemini API key** ([Get one here](https://aistudio.google.com/app/apikey))

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── cover-letter/
│   │   │   └── route.ts      # Gemini integration + SSE streaming
│   │   └── user-profile/
│   │       └── route.ts      # Serves saved user profile (GET)
│   ├── components/
│   │   ├── InputPanel.tsx    # Form fields + tone sliders + generate/stop buttons
│   │   ├── OutputPanel.tsx   # Streaming output, status, errors, copy action
│   │   └── ToneSlider.tsx    # Reusable range slider with label/badges
│   ├── CoverLetterPanel.tsx  # Main client component orchestrating state & SSE playback
│   ├── layout.tsx            # Root layout + metadata
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── lib/
│   ├── prompt.ts             # System prompt builder from candidate + job data
│   ├── sseClient.ts          # Client-side SSE parser used for streaming responses
│   └── userProfile.ts        # Server-side utility to load user-profile.json
├── user-profile.example.json # Template for the user profile configuration
├── user-profile.json         # Your profile (gitignored — contains personal data)
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── .env.example              # Environment variable template
```

## Getting Started

1. **Clone and enter the project directory**

   ```bash
   cd /Users/aeriech/Documents/code-projects/nextjs-projects/cover-letter-generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure the environment**

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and set your Gemini API key:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Set up your user profile** (optional but recommended)

   ```bash
   cp user-profile.example.json user-profile.json
   ```

   Edit `user-profile.json` with your real name, contact info, experience summary, and key skills. The form will auto-populate from this file on every visit.

5. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Lint the project with ESLint (next config) |
| `npm run typecheck` | Type-check the project with `tsc --noEmit` |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Google Generative AI API key used by the backend route |

## User Profile Configuration

Your personal information is stored in `user-profile.json` at the project root. This file is **gitignored** to prevent accidental commits of personal data.

| Field | Description |
| --- | --- |
| `fullName` | Your full name |
| `email` | Your email address |
| `phone` | Your phone number |
| `experienceSummary` | A brief professional summary (2–3 sentences) |
| `keySkills` | Comma-separated list of key skills |

When you load the app, the form automatically fetches this data from `GET /api/user-profile` and fills in the fields. You can still override any field before generating — the profile values are just initial defaults.

## How It Works

1. On first load, the app fetches `GET /api/user-profile` which reads `user-profile.json` from disk and pre-populates the form. The user can tweak any field or paste a new job description.
2. They optionally adjust the **Formality** and **Friendliness** sliders.
3. On submission, the client sends a `POST` request with `Accept: text/event-stream` to `/api/cover-letter`.
4. The route builds a system prompt from the form state and calls Google Generative AI with streaming enabled.
5. Tokens are streamed back to the client as SSE events, rendered character-by-character in the output panel.
6. If one model fails, the route retries with fallback models, reporting each attempt back to the client.

## Technical Implementation: Conditional Button States

A form submission button typically has three possible states depending on whether required input data is present. Below are the implementation patterns used in this project and their trade-offs.

### State 1: Visible + Disabled (ghosted)

The button renders in the DOM but applies reduced opacity and removes interactivity via the HTML `disabled` attribute.

```tsx
const canSubmit = fullName.trim() !== "" && experienceSummary.trim() !== "" && jobDescription.trim() !== "";

<button onClick={onSubmit} disabled={!canSubmit}>
  Generate cover letter
</button>
```

```css
/* Tailwind: disabled:opacity-50 disabled:cursor-not-allowed */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Pros**:
- DOM position is stable — no layout shift when state changes
- Accessibility tree announces the button as disabled (screen readers receive the `disabled` attribute)
- User can see what action is expected once the form is complete

**Cons**:
- At 50% opacity the button can be easily overlooked, especially on white backgrounds
- Without a hint, the user may not know why it is disabled

**This project uses a variant with increased visibility** — instead of pure transparency, the disabled button shifts to a muted background (`bg-accent/40`) with a subtle border and retains `cursor: not-allowed`. An inline hint message lists the missing fields directly below the button.

### State 2: Hidden (conditional rendering)

The button is absent from the DOM until the required data exists.

```tsx
const fieldsComplete = fullName.trim() !== "" && experienceSummary.trim() !== "" && jobDescription.trim() !== "";

{fieldsComplete && <button onClick={onSubmit}>Generate cover letter</button>}
```

```css
/* Or use CSS visibility to preserve layout space */
{<button style={{ visibility: fieldsComplete ? "visible" : "hidden" }}>Generate cover letter</button>}
```

**Pros**:
- Eliminates confusion — no ghost UI elements
- Forces the user to complete the form before seeing the action

**Cons**:
- Can cause confusion of a different kind: the user may not know what to do after filling the form
- Conditional rendering causes layout shifts (unless using `visibility: hidden`)
- Accessibility: screen readers do not announce an element that does not exist

### State 3: Visible + Enabled with runtime validation

The button is always rendered and active, but submission triggers inline validation that highlights missing fields.

```tsx
const [touched, setTouched] = useState(false);

function handleSubmit() {
  setTouched(true);
  const errors = [];
  if (!fullName.trim()) errors.push("Full name is required");
  if (!experienceSummary.trim()) errors.push("Experience summary is required");
  if (!jobDescription.trim()) errors.push("Job description is required");
  if (errors.length > 0) return setValidationErrors(errors);
  // proceed with generation
}

<button onClick={handleSubmit}>Generate cover letter</button>
{errors.map((e) => <p className="text-danger">{e}</p>)}
```

**Pros**:
- Button is always visible and clickable — no confusion
- Validation feedback is contextual (points to the specific missing data)

**Cons**:
- Encourages a click → fail → fix → click cycle instead of proactive guidance
- Requires managing `touched` state to avoid showing errors on initial page load

### Combined pattern used in this project

The current implementation in `InputPanel.tsx` combines approach 1 (visible + disabled) with an inline hint:

```tsx
const canSubmit =
  form.fullName.trim().length > 0 &&
  form.experienceSummary.trim().length > 0 &&
  form.jobDescription.trim().length > 0 &&
  !streaming;

const missingFields: string[] = [];
if (!form.fullName.trim()) missingFields.push("Full name");
if (!form.experienceSummary.trim()) missingFields.push("Experience summary");
if (!form.jobDescription.trim()) missingFields.push("Job description");

return (
  <>
    <button
      onClick={onSubmit}
      disabled={!canSubmit}
      className="w-full rounded-xl border border-accent/30 bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-border disabled:bg-panel-2 disabled:text-muted disabled:hover:brightness-100 sm:w-auto"
    >
      Generate cover letter
    </button>
    {!canSubmit && missingFields.length > 0 && (
      <p className="mt-2 text-xs text-muted/70">
        Fill in {missingFields.join(", ")} to enable generation.
      </p>
    )}
  </>
);
```

**Design rationale**:
- The button is always rendered, preventing layout shift and preserving accessibility
- The disabled state uses `bg-accent/40` (40% opacity on the accent color) instead of `opacity-50` on the whole element, keeping the button recognizable as the primary action while clearly differentiating it from the enabled state
- The hint message is dynamically generated from the `missingFields` array, guiding the user toward exactly what is needed
- During streaming, the button is swapped entirely for a **Stop** button via `{!streaming ? <GenerateButton /> : <StopButton />}`, which is appropriate here because the two actions are mutually exclusive and the layout is fixed-height, avoiding shift
