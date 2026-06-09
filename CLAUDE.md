# react-sup

A React (Vite + TypeScript) app with Supabase authentication and a Todo manager.

## Tech Stack
- React 18 + TypeScript
- Vite 5
- react-router-dom v7
- @supabase/supabase-js v2

## Project Structure
```
src/
  context/
    AuthContext.tsx       # Global auth state via React Context + Supabase listener
  lib/
    supabaseClient.ts     # Supabase client instance (reads from .env.local)
  pages/
    Login.tsx             # Email/password + Google OAuth login and signup
    Dashboard.tsx         # Protected page, shows user email + TodoManager
  components/
    TodoManager.tsx       # Full CRUD todos connected to Supabase with Realtime
  App.tsx                 # Router, ProtectedRoute, wraps AuthProvider
  main.tsx                # React root mount
```

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

## Supabase Project
- Project ID: `yiikzdzwuwgmanpzdvjs`
- Region: ap-northeast-1
- Auth: Email/password + Google OAuth enabled
- Table: `todos` (id, user_id, text, created_at) with RLS enabled
- Realtime: enabled on `todos` table

## Running Locally
```bash
npm install
npm run dev
```
App runs at http://localhost:5173

## Routes
- `/` — public landing page
- `/login` — email/password + Google login and signup
- `/dashboard` — protected, requires login

## Test User
- Email: test@test.com
- Password: Test1234!

## Authentication Flow
1. User logs in via `Login.tsx` (email or Google)
2. Supabase returns a JWT stored in localStorage
3. `AuthContext.tsx` picks it up via `onAuthStateChange`
4. `ProtectedRoute` in `App.tsx` checks session before allowing `/dashboard`
5. `TodoManager.tsx` uses `session.user.id` to scope all DB queries

## Deployment — Netlify
- Live URL: https://react-sup.netlify.app
- GitHub repo: https://github.com/jpdelacruz3/jobysupbase
- CI/CD: every push to `main` triggers an auto-deploy on Netlify
- Build command: `npm run build`, publish dir: `dist`
- SPA redirects configured in `netlify.toml` (all routes → `index.html`)
- Environment variables set in Netlify UI: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Google OAuth Config
- Supabase callback URL: `https://<project-id>.supabase.co/auth/v1/callback`
- Supabase Site URL: `https://react-sup.netlify.app`
- Supabase Redirect URLs whitelist:
  - `http://localhost:5173/**`
  - `https://react-sup.netlify.app/**`
- Google Cloud Console authorized JavaScript origins: `http://localhost:5173`, `https://react-sup.netlify.app`
