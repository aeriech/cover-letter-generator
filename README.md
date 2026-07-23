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
