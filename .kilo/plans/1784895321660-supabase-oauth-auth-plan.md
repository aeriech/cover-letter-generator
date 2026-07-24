# Supabase OAuth Authentication Plan (Google + GitHub)

## Architecture Overview

- **Optional auth**: Guests can still generate cover letters without signing in. Auth saves/loads profile from Supabase.
- **File-based `user-profile.json` is replaced**: Once implemented, profiles live in the `user_profiles` Supabase table.
- **Session persistence**: 30-day cookie `maxAge` + Supabase Auth session duration set to 30 days.
- **Auth state**: React context (`AuthProvider`) wrapping the root layout.

---

## Implementation Tasks (ordered)

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Environment Variables

Add to `.env.example` and `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Supabase Client Utilities (3 files)

**`lib/supabase/client.ts`** — Browser client with 30-day cookie persistence:
- `createBrowserClient(url, anonKey, { cookieOptions: { maxAge: 2592000 } })`

**`lib/supabase/server.ts`** — Server component / API route client:
- `createServerClient(url, anonKey, { cookies })` using `cookies()` from `next/headers`
- Shared by route handlers, server components, and the callback route

**`lib/supabase/middleware.ts`** — Middleware client:
- `createServerClient(url, anonKey)` using request/response cookie helpers
- Called only from `middleware.ts`

### 4. Middleware (`middleware.ts` at root)

- Uses `createMiddlewareClient` helper from the supabase client
- Calls `await supabase.auth.getSession()` on every request to refresh tokens
- Does **NOT** redirect or gate any routes — auth is optional

### 5. Database Migration (SQL to run in Supabase SQL Editor)

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  experience_summary TEXT,
  key_skills TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### 6. Auth Callback Route (`app/auth/callback/route.ts`)

- `GET` handler (export async function GET)
- Reads `code` and `next` from search params
- Calls `supabase.auth.exchangeCodeForSession(code)` to set session cookies
- Fetches `supabase.auth.getUser()` to get authenticated user
- Upserts into `user_profiles` with `email`, `full_name` (from `user_metadata`) and `user_id`
- Redirects to `next` (or `/`)

### 7. Auth Sign-Out Route (`app/auth/signout/route.ts`)

- Calls `supabase.auth.signOut()`
- Redirects to `/`

### 8. User Profile API (`app/api/user-profile/route.ts`)

**GET (modified)**:
- If authenticated: fetch profile from `user_profiles` for `user_id`, return JSON
- If not authenticated: return `{}` (empty profile, no error — frontend handles)
- Removes `fs.readFileSync` for `user-profile.json`

**PUT (new)**:
- Requires authentication (returns 401 if not)
- Accepts JSON body with fields: `fullName`, `email`, `phone`, `experienceSummary`, `keySkills`
- Upserts to `user_profiles` table (mapped to snake_case)
- Returns success or error

### 9. Auth Context & Provider (`app/components/AuthProvider.tsx`)

- React context providing: `user`, `profile`, `loading`, `signIn(provider)`, `signOut()`, `updateProfile(data)`, `refreshProfile()`
- On mount: calls `/api/auth/user` (or uses Supabase client directly) to get current session
- `signIn(provider)`: calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })`
- `signOut()`: calls `/api/auth/signout`
- `updateProfile(data)`: calls `PUT /api/user-profile`
- Wraps children, accessible via `useAuth()` hook

### 10. Auth UI Components

**`app/components/AuthButtons.tsx`**:
- "Sign in with Google" and "Sign in with GitHub" buttons
- Each calls `signIn('google')` or `signIn('github')`
- Styled consistently with existing Tailwind theme

**`app/components/UserMenu.tsx`**:
- Shows user avatar/initials + name when authenticated
- Dropdown or inline "Sign Out" button

### 11. Integrate Auth into Existing Components

**`app/layout.tsx`**:
- Wrap children with `<AuthProvider>`
- Add `<AuthButtons />` or `<UserMenu />` in the header

**`app/CoverLetterPanel.tsx`**:
- Use `useAuth()` to get `user` and `profile` state
- Pass auth state (isAuthenticated, profile) to `InputPanel`

**`app/components/InputPanel.tsx`**:
- On mount: fetch profile from `/api/user-profile` (keep existing behavior, but origin changes)
- When authenticated: show a "Save Profile" button that calls `updateProfile`
- Pre-fill fields from server-fetched profile (existing behavior works as-is)
- The `user_profile.json` file read is no longer needed — fetch replaces it

### 12. Remove `lib/userProfile.ts` (deprecated)

- This file reads from `user-profile.json` on disk — no longer used
- Delete it

---

## Supabase Dashboard Configuration (User Must Do)

1. **Create Supabase project** at supabase.com
2. **Get project credentials** from Settings → API → Project URL + anon key → add to `.env`
3. **Run the SQL migration** in Supabase SQL Editor
4. **Set session duration**: Authentication → Settings → Session duration → `2592000` (30 days)
5. **Enable Google provider**:
   - Create OAuth 2.0 Client ID at Google Cloud Console (APIs & Services → Credentials)
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Enter Client ID + Client Secret in Supabase Auth Providers
6. **Enable GitHub provider**:
   - Create OAuth App at GitHub Settings → Developer settings → OAuth Apps
   - Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Enter Client ID + Client Secret in Supabase Auth Providers

---

## Validation

- `npm run build` (or `npm run lint && npm run typecheck`) must pass
- Guest users can load the app, fill the form, and generate cover letters without auth
- Sign in with Google / GitHub redirects through the OAuth flow and back to the app
- After sign-in, the user's email and name pre-fill in the form
- "Save Profile" persists phone, experienceSummary, and keySkills to Supabase
- Closing and reopening the browser maintains the authenticated session (cookie `maxAge` = 30 days)
- Sign out clears the session and returns to guest mode
- The `user_profiles` table is correctly populated after auth callback and profile saves
