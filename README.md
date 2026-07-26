# Cover Letter Generator

A web application that writes tailored, professional cover letters for you. You fill in your profile and paste a job description, and the app generates a custom cover letter that you can copy and use right away.

The app runs entirely in your browser. Your personal data is stored securely in a database you control, and you can sign in with your Google or GitHub account.

---
## 🚀 Live Demo
[🌐 aeriech-cover-letter-generator.vercel.app](https://aeriech-cover-letter-generator.vercel.app)
---

## Table of Contents

- [What This App Does](#what-this-app-does)
- [Features](#features)
- [Prerequisites (What You Need Before Starting)](#prerequisites-what-you-need-before-starting)
- [Part 1: Set Up the Services You Need](#part-1-set-up-the-services-you-need)
  - [Step 1.1 — Get a Gemini API Key](#step-11--get-a-gemini-api-key)
  - [Step 1.2 — Create a Supabase Account and Project](#step-12--create-a-supabase-account-and-project)
  - [Step 1.3 — Run the Database Migration](#step-13--run-the-database-migration)
  - [Step 1.4 — Set Up Google Sign-In](#step-14--set-up-google-sign-in)
  - [Step 1.5 — Set Up GitHub Sign-In](#step-15--set-up-github-sign-in)
  - [Step 1.6 — Configure Session Duration](#step-16--configure-session-duration)
- [Part 2: Install and Run the App Locally](#part-2-install-and-run-the-app-locally)
  - [Step 2.1 — Install Node.js](#step-21--install-nodejs)
  - [Step 2.2 — Download the Project](#step-22--download-the-project)
  - [Step 2.3 — Install Dependencies](#step-23--install-dependencies)
  - [Step 2.4 — Set Up Environment Variables](#step-24--set-up-environment-variables)
  - [Step 2.5 — Start the App](#step-25--start-the-app)
- [Part 3: Deploy to the Internet](#part-3-deploy-to-the-internet)
  - [Step 3.1 — Push Your Code to GitHub](#step-31--push-your-code-to-github)
  - [Step 3.2 — Create a Vercel Account](#step-32--create-a-vercel-account)
  - [Step 3.3 — Deploy from GitHub](#step-33--deploy-from-github)
  - [Step 3.4 — Set Environment Variables in Vercel](#step-34--set-environment-variables-in-vercel)
  - [Step 3.5 — Update OAuth Redirect URLs](#step-35--update-oauth-redirect-urls)
- [How to Use the App](#how-to-use-the-app)
- [Troubleshooting](#troubleshooting)
- [How It Works (Behind the Scenes)](#how-it-works-behind-the-scenes)

---

## What This App Does

1. You enter your **name, contact info, work experience, and skills**.
2. You **paste the text of a job description** you want to apply for.
3. You adjust the **tone** (how formal or friendly the letter should be).
4. You click **Generate** and a custom cover letter appears, written just for you.

You can sign in with Google or GitHub so your profile is saved and automatically loaded the next time you visit.

---

## Features

- **Sign in with Google or GitHub** — No passwords to remember.
- **Saved profile** — Your name, email, phone, experience, and skills are stored safely. When you come back, they are already filled in.
- **Job-description-aware** — The letter is written specifically for the job you paste in; it uses the right keywords and matches the role.
- **Tone control** — Two sliders let you make the letter casual or formal, direct or warm.
- **Real-time streaming** — The letter appears on screen word by word as it is being written (no waiting for the whole thing to finish).
- **Copy with one click** — When the letter is done, click Copy to put it on your clipboard.

---

## Prerequisites (What You Need Before Starting)

Before you can run this app, you need a few free accounts:

| What | Why | Cost |
|---|---|---|
| **A computer** (Mac, Windows, or Linux) | To run the app | — |
| **Internet connection** | To download files and use the AI service | — |
| **Google account** (Gmail) | To get a Gemini API key and optionally sign in to the app | Free |
| **GitHub account** | To optionally sign in to the app and deploy it | Free |
| **Supabase account** | To store user profiles and handle sign-in | Free tier available |

> If you already have a Google account and a GitHub account, you are ready to go. The Supabase account is also free.

---

## Part 1: Set Up the Services You Need

This part only needs to be done once. You will create accounts with three services and configure them so the app can use them.

### Step 1.1 — Get a Gemini API Key

Gemini is Google's AI — it is the engine that writes the cover letters. You need a key to use it.

1. Go to <https://aistudio.google.com/app/apikey>.
2. Sign in with your Google account.
3. Click **Create API key**.
4. Select **Create API key in new project** (or pick an existing project if you have one).
5. Copy the long string of letters and numbers that appears. This is your **API key**.
6. Store it somewhere safe (you will paste it into a file later). It looks something like:
   ```
   AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 1.2 — Create a Supabase Account and Project

Supabase is the database that stores your profile information and handles sign-ins.

1. Go to <https://supabase.com> and click **Start your project**.
2. Sign in with your GitHub account (or create an account with email).
3. Once logged in, you will see a dashboard. Click **New project**.
4. Fill in:
   - **Name**: `Cover Letter Generator` (or anything you like)
   - **Database Password**: Create a strong password and **write it down** (you will not need it often, but you need it to rescue your data if something goes wrong).
   - **Region**: Pick a region close to you (e.g., `US West (Oregon)` if you are in the Americas, `EU West` if in Europe, `Singapore` if in Asia).
   - **Pricing Plan**: Select **Free**.
5. Click **Create new project**. It takes about 1–2 minutes to set up.
6. Once the project is ready, look in the left sidebar for **Project Settings** > **API** (or go to the URL `https://supabase.com/dashboard/project/_/settings/api`).
7. On this page you will find two important values:
   - **Project URL** — looks like `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **anon public** key — a long Base64 string starting with `eyJ...`
8. Copy both of these — you will paste them into the app's configuration file later.

### Step 1.3 — Run the Database Migration

This creates the table where user profiles are stored.

1. In the Supabase dashboard, click the **SQL Editor** tab in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/migration.sql` from the project folder on your computer (you can open it with any text editor like Notepad or TextEdit).
4. Copy the entire contents of that file.
5. Paste it into the SQL Editor in Supabase.
6. Click **Run** (or press `Cmd+Enter` on Mac / `Ctrl+Enter` on Windows).
7. You should see a green success message like "Success. No rows returned."

The database is now ready.

### Step 1.4 — Set Up Google Sign-In

This allows users to sign in with their Google account.

1. Go to the **Google Cloud Console**: <https://console.cloud.google.com/>
2. If prompted, select or create a project (you can use the same project from Step 1.1).
3. In the left menu, go to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** at the top and choose **OAuth client ID**.
5. If you see a "Configure consent screen" prompt, click **Configure Consent Screen**:
   - Choose **External** and click **Create**.
   - Fill in the **App name** (e.g., "Cover Letter Generator"), your **User support email**, and your **Developer contact information**.
   - Click **Save and Continue** through the remaining screens (you do not need to add scopes or test users).
6. After configuring the consent screen, go back to **Create Credentials** > **OAuth client ID**.
7. For **Application type**, select **Web application**.
8. In **Name**, enter "Cover Letter Generator".
9. Under **Authorized redirect URIs**, click **Add URI** and enter:
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   Replace `<YOUR-PROJECT-REF>` with the random string in your Supabase project URL. For example, if your Supabase URL is `https://abcdefghijklm.supabase.co`, then your redirect URI should be:
   ```
   https://abcdefghijklm.supabase.co/auth/v1/callback
   ```
10. Click **Create**.
11. A window will pop up showing your **Client ID** and **Client Secret**. Copy both.

Now add these to Supabase:

1. In Supabase, go to **Authentication** > **Providers** in the left sidebar.
2. Find **Google** and toggle it **Enabled**.
3. Paste your **Client ID** and **Client Secret** from Google into the fields.
4. Click **Save**.

Google sign-in is now configured.

### Step 1.5 — Set Up GitHub Sign-In

1. Go to <https://github.com/settings/developers>.
2. Click **OAuth Apps** in the left sidebar, then click **New OAuth App**.
3. Fill in:
   - **Application name**: `Cover Letter Generator`
   - **Homepage URL**: `http://localhost:3000` (you will update this later if you deploy)
   - **Authorization callback URL**:
     ```
     https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
     (Replace `<YOUR-PROJECT-REF>` with your Supabase project's reference string, same as above.)
4. Click **Register application**.
5. You will see a **Client ID** (a long string of letters and numbers). Click **Generate a new client secret** and copy the **Client Secret** that appears.

Now add these to Supabase:

1. In Supabase, go to **Authentication** > **Providers**.
2. Find **GitHub** and toggle it **Enabled**.
3. Paste your **Client ID** and **Client Secret** from GitHub into the fields.
4. Click **Save**.

GitHub sign-in is now configured.

### Step 1.6 — Configure Session Duration

This makes sure you stay signed in for 30 days instead of being logged out every time you close your browser.

1. In Supabase, go to **Authentication** > **Settings** in the left sidebar.
2. Find **Session duration** (under "General").
3. Change the value to `2592000` (this is 30 days measured in seconds).
4. Click **Save**.

---

## Part 2: Install and Run the App Locally

"Locally" means the app runs on your own computer. You will be able to open it in your web browser at `http://localhost:3000`.

### Step 2.1 — Install Node.js

Node.js is the engine that runs the app on your computer.

1. Go to <https://nodejs.org/>.
2. Download the **LTS** version (the left button, which says "Recommended For Most Users").
3. Open the downloaded file and follow the installation instructions. The default settings are fine — just click **Next** through the installer.
4. **Restart your computer** after installation.

To verify it installed correctly:
- **Mac**: Open **Terminal** (from Applications > Utilities), type `node --version`, and press Enter. You should see a version number like `v18.17.0` or higher.
- **Windows**: Open **Command Prompt** (type "cmd" in the Start menu), type `node --version`, and press Enter. You should see a version number.

### Step 2.2 — Download the Project

You have the project folder on your computer already (this is where these instructions are). If not, download it from wherever it is stored.

The project is the folder containing files like `package.json`, `app/`, `lib/`, etc.

### Step 2.3 — Install Dependencies

Dependencies are pre-built pieces of code that the app needs to work.

1. Open **Terminal** (Mac) or **Command Prompt** (Windows).
2. Navigate to the project folder. Type `cd ` (with a space after it), then drag the project folder from your file manager into the terminal window, and press Enter. For example:
   ```
   cd /Users/YourName/Documents/cover-letter-generator
   ```
3. Once you are in the project folder, type the following command and press Enter:
   ```
   npm install
   ```
   This will take about 30 seconds to a minute. You will see a lot of text scroll by — that is normal.

### Step 2.4 — Set Up Environment Variables

Environment variables are like configuration settings the app reads when it starts.

1. In the project folder, find the file named **`.env.example`**.
2. Make a copy of it and rename the copy to **`.env.local`**.
   - **On Mac**: Right-click the file, hold down `Option` and choose "Copy", then rename the copy.
   - **On Windows**: Right-click, choose Copy, right-click again, choose Paste, then rename.
   - **Alternative**: Open Terminal/Command Prompt in the project folder and type:
     ```
     cp .env.example .env.local
     ```
3. Open the new **`.env.local`** file with any text editor (Notepad, TextEdit, VS Code, etc.).
4. You will see three lines:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```
5. Replace each value with the actual ones:
   - `GEMINI_API_KEY` — paste the API key you got from Step 1.1.
   - `NEXT_PUBLIC_SUPABASE_URL` — paste your Supabase project URL from Step 1.2 (looks like `https://xxxxxxx.supabase.co`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — paste your Supabase anon key from Step 1.2 (starts with `eyJhbGciOiJ...`).
6. Save the file. Your `.env.local` should now look something like this (but with your real values):
   ```
   GEMINI_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxx
   ```

> **Important**: Do NOT share this file with anyone. It contains your private API keys.

### Step 2.5 — Start the App

1. In Terminal or Command Prompt (still in the project folder), type:
   ```
   npm run dev
   ```
2. You will see messages like:
   ```
   ▲ Next.js 14.2.35
   - Local: http://localhost:3000
   ```
3. Open your web browser and go to **http://localhost:3000**.
4. The app should appear! You can now:
   - Sign in with Google or GitHub (the buttons are in the top-right corner).
   - Fill in your profile.
   - Paste a job description.
   - Click **Generate cover letter** to see the AI write one for you.

To stop the app, go back to the terminal and press **Ctrl+C** (hold the Control key and press C).

---

## Part 3: Deploy to the Internet

"Deploying" means making the app available on a real website that anyone can visit. We will use **Vercel**, which is free and works perfectly with this type of app.

### Step 3.1 — Push Your Code to GitHub

You need to put the code on GitHub so Vercel can access it.

1. Go to <https://github.com/> and sign in.
2. Click the **+** icon in the top-right corner and choose **New repository**.
3. Give it a name like `cover-letter-generator`.
4. Leave it as **Public** (or **Private** — either works).
5. Do NOT check "Add a README", "Add .gitignore", or "Choose a license". The project already has these.
6. Click **Create repository**.
7. On the next screen, you will see commands under "…or push an existing repository from the command line." Follow those commands. They look like:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/cover-letter-generator.git
   git branch -M main
   git push -u origin main
   ```
   (The actual URLs will be specific to your account.)
8. If you get asked for a username and password, use your GitHub username and a **personal access token** (not your regular password). To create one:
   - Go to <https://github.com/settings/tokens>.
   - Click **Generate new token (classic)**.
   - Give it a name, check the `repo` box, and scroll down to click **Generate token**.
   - Copy the token and use it as your password.

### Step 3.2 — Create a Vercel Account

1. Go to <https://vercel.com/>.
2. Click **Sign Up** and choose **Continue with GitHub** (this is the easiest method).
3. Authorize Vercel to access your GitHub account.

### Step 3.3 — Deploy from GitHub

1. On the Vercel dashboard, click **Add New…** > **Project**.
2. Find your `cover-letter-generator` repository and click **Import**.
3. Vercel will automatically detect that it is a Next.js project. Leave all the default settings.
4. Click **Deploy**. The deployment will take about 1–2 minutes.
5. When it finishes, you will see a **Congratulations!** page with a URL like `https://cover-letter-generator-xxxxx.vercel.app`. This is your live website!

### Step 3.4 — Set Environment Variables in Vercel

Your live app needs the same configuration settings as your local copy.

1. On the Vercel project dashboard, go to **Settings** > **Environment Variables**.
2. Add the following three variables with their values (the same values from your `.env.local` file):
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Save**.
4. Go to **Deployments**, find the latest deployment, click the three dots (…), and choose **Redeploy** to apply the new environment variables.

### Step 3.5 — Update OAuth Redirect URLs

Now that your app has a real URL, you need to update the OAuth settings so Google and GitHub know where to send users after they sign in.

**For Google (Cloud Console):**
1. Go back to <https://console.cloud.google.com/apis/credentials>.
2. Find the OAuth client ID you created earlier and click the edit (pencil) icon.
3. Under **Authorized redirect URIs**, add a NEW entry:
   ```
   https://cover-letter-generator-xxxxx.vercel.app/auth/callback
   ```
   (Use your actual Vercel URL.)
4. Click **Save**.

**For GitHub:**
1. Go to <https://github.com/settings/developers>.
2. Find your OAuth App and click **Edit**.
3. Update **Homepage URL** to your Vercel URL: `https://cover-letter-generator-xxxxx.vercel.app`
4. Update **Authorization callback URL** to include your Vercel URL:
   ```
   https://cover-letter-generator-xxxxx.vercel.app/auth/callback
   ```
5. Click **Update application**.

**For Supabase (Auth Settings):**
1. Go to **Authentication** > **Settings** > **Redirect URLs**.
2. Add your Vercel URL:
   - `https://cover-letter-generator-xxxxx.vercel.app/**` (the `/**` at the end allows any page)
3. Click **Save**.

Your deployed app should now be fully functional. Visit your Vercel URL to use it.

---

## How to Use the App

1. **Sign in** (optional but recommended): Click "Sign in with Google" or "Sign in with GitHub" in the top-right corner. This saves your profile so it is there when you come back.
2. **Fill in your profile**: Enter your name, email, phone number, a brief summary of your experience (2–3 sentences), and your key skills (comma-separated).
3. **Paste a job description**: Find a job you want to apply for and paste the full description into the "Job description" box.
4. **Adjust tone (optional)**: Use the sliders to set how formal and how friendly you want the letter to be.
5. **Generate**: Click the **Generate cover letter** button. The letter will appear on the right side of the screen, word by word.
6. **Copy**: When it is finished, click **Copy** to put it on your clipboard.
7. **Stop (if needed)**: If you want to cancel mid-generation, click **Stop**.
8. **Save your profile (if signed in)**: After filling in your profile, click **Save profile** so the information is stored for next time.

---

## Troubleshooting

### "Cannot find module" or "Module not found" error when running `npm run dev`
Run `npm install` again to make sure all dependencies are installed. If it still fails, delete the `node_modules` folder and the `package-lock.json` file, then run `npm install` again.

### "Your project's URL and API key are required" error
The `.env.local` file is missing or has incorrect values. Make sure you have:
- `NEXT_PUBLIC_SUPABASE_URL` set to your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` set to your Supabase public anon key

### "401" or "Unauthorized" when trying to save profile
You need to sign in first. Use the Google or GitHub sign-in buttons in the top-right corner.

### "Auth session missing" error when signing in
Make sure the **redirect URI** in your Google/GitHub OAuth settings exactly matches the callback URL. For local development it should be `https://<your-project>.supabase.co/auth/v1/callback`.

### "Network error — is the backend running?" when generating
This means the app cannot contact the Gemini API. Check that:
1. Your `GEMINI_API_KEY` in `.env.local` is correct.
2. You have an internet connection.
3. The API key has not been rate-limited or revoked.

### The app starts but shows a blank page
Open your browser's developer tools (right-click anywhere → **Inspect** → **Console** tab) and look for any red error messages. These will give clues about what went wrong.

### Port 3000 is already in use
If you already have something running on port 3000, you can use a different port:
```
npm run dev -- -p 3001
```
Then go to `http://localhost:3001` in your browser.

---

## How It Works (Behind the Scenes)

This section is for people who are curious about the technical side. You do not need to understand it to use the app.

### The Big Picture

```
Your browser ──► App server ──► Gemini AI (Google)
                        │
                   ┌────┴────┐
                   │  Supabase  │
                   │ (database + │
                   │  sign-in)   │
                   └─────────┘
```

### Components

| Piece | What It Does |
|---|---|
| **Next.js** | The framework that runs the web server and renders pages. |
| **React** | The UI library that makes the page interactive. |
| **Gemini API** | Google's AI model that writes the cover letter text. |
| **Supabase** | Stores user profiles in a database and handles Google/GitHub sign-in. |
| **@supabase/ssr** | Manages the login session using browser cookies. |

### Flow

1. When you sign in, Supabase handles the OAuth flow with Google or GitHub and creates a session. This session is stored in a cookie that lasts for 30 days, so you stay logged in even after closing the browser.
2. On your first sign-in, the app creates a profile for you in the Supabase database with your name and email (from your Google/GitHub account).
3. When you fill in your profile and click **Save profile**, the app sends a `PUT` request to `/api/user-profile`, which writes your data to the `user_profiles` table in Supabase.
4. When you return to the app, it looks up your profile from Supabase and fills in the form automatically.
5. When you click **Generate cover letter**, the app sends your form data to the Gemini API, which streams the letter back in real time.
6. The letter appears on screen as it is being written, character by character.

### Session Persistence (Why You Stay Logged In)

The app uses two mechanisms to keep you signed in for 30 days:

- **Cookie maxAge**: The login cookie on your browser is set to expire after 30 days (2,592,000 seconds).
- **Supabase session duration**: The authentication server allows the session to last for 30 days before requiring a new sign-in.

Because the cookie is a "persistent" cookie (not a "session" cookie), it survives closing and reopening your browser.

---

## Available Commands (for reference)

These are for when you or someone technical needs to run common tasks.

| Command | What It Does |
|---|---|
| `npm install` | Download all necessary code packages |
| `npm run dev` | Start the app in development mode (for testing changes) |
| `npm run build` | Create an optimized version for production |
| `npm run start` | Run the optimized production version |
| `npm run typecheck` | Check the code for type errors |

---

## Project Structure

```
.
├── app/                          # The website pages and API routes
│   ├── api/
│   │   ├── cover-letter/route.ts # The AI-powered letter generator
│   │   └── user-profile/route.ts # Reads/writes your saved profile
│   ├── auth/
│   │   ├── callback/route.ts     # Handles sign-in redirects
│   │   └── signout/route.ts      # Handles sign-out
│   ├── components/               # Reusable UI pieces
│   │   ├── AuthButtons.tsx       # Google and GitHub sign-in buttons
│   │   ├── AuthProvider.tsx      # Manages login state everywhere
│   │   ├── Header.tsx            # Top bar with sign-in/account info
│   │   ├── InputPanel.tsx        # Form with all the fields
│   │   ├── OutputPanel.tsx       # Shows the generated letter
│   │   ├── ToneSlider.tsx        # The formality/friendliness sliders
│   │   └── UserMenu.tsx          # Shows your avatar and sign-out
│   ├── AuthWrapper.tsx           # Connects login state to the app
│   ├── CoverLetterPanel.tsx      # Main screen that connects everything
│   ├── layout.tsx                # Root page structure
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/                          # Helper code
│   ├── supabase/
│   │   ├── client.ts             # Supabase setup for browser
│   │   ├── middleware.ts         # Supabase setup for session refresh
│   │   └── server.ts             # Supabase setup for API routes
│   ├── prompt.ts                 # Instructions sent to the AI
│   └── sseClient.ts              # Handles real-time text streaming
├── supabase/
│   └── migration.sql             # Database setup instructions
├── middleware.ts                  # Refreshes login sessions
├── .env.example                  # Template for configuration
├── package.json                  # Project info and dependencies
├── tailwind.config.ts            # Visual style settings
└── next.config.mjs               # App engine settings
```

---

*Built with Next.js 14, React 18, Tailwind CSS v4, Google Gemini AI, and Supabase.*
