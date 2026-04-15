# Job application tracker

A full-stack web app for tracking job applications through a simple pipeline: wishlist, applied, interviewing, offer, or rejected. You can manage roles in a Kanban board, skim metrics on a dashboard, dig into analytics, and optionally run an AI-assisted pass over a posting (skills to highlight, mock questions, a rough resume fit score, and a short tip) backed by Google’s Gemini API.

## What it does

- **Authentication** — Firebase Auth on the client; the server exchanges the Firebase ID token for an HTTP-only session cookie and verifies it with the Firebase Admin SDK on each request.
- **User profile** — After sign-in, users who are not yet in PostgreSQL are sent through profile completion so every row in `jobs` ties back to a stable `users.id`.
- **Jobs** — Create, edit, delete, search, filter by status, and sort applications. Status changes can drive fields like applied date (handled in server actions).
- **Job finder** — Search external listings through the JSearch API (RapidAPI), review details in-app, and add promising roles directly into your tracker pipeline.
- **Board** — Drag-and-drop columns (`@dnd-kit`) with ordering persisted per user.
- **Dashboard & analytics** — Summary cards, status distribution, and charts (`recharts`) over the same Postgres data.
- **Interview prep (optional)** — Server action calls Gemini with a structured JSON schema; results are stored in `job_interview_prep` and shown in the UI.

## Architecture (at a glance)

| Layer | Role |
| --- | --- |
| **Next.js App Router** | Route groups: `(public)` for auth flows, `(private)` for the app shell. Server Components load data; mutations go through **Server Actions** (`"use server"`) in `src/actions/`. |
| **PostgreSQL + Drizzle** | Typed schema and queries in `src/db/`; enums for job status; migrations live under `drizzle/`. |
| **Firebase** | Client SDK in `src/lib/firebase/client.ts`; Admin SDK for session cookies and verification in `src/lib/firebase/admin.ts`. Session API: `src/app/api/auth/session/route.ts`. |
| **Forms & validation** | Mix of Formik/Yup in some UI flows and **Zod** on the server for job payloads and interview-prep payloads. |
| **UI** | React 19, Tailwind CSS v4, Sonner toasts, and a small set of shared components under `src/components/`. |

The private layout gates routes: no session → sign-in; session but no DB user → complete sign-up; otherwise render the sidebar and children.

## Prerequisites

- **Node.js** — Use a current LTS (for example 20.x or 22.x) compatible with Next.js 16.
- **PostgreSQL** — Any reachable instance; connection string goes in `DATABASE_URL`.
- **Firebase project** — Web app config for the client; service account fields for the Admin SDK (session cookies).
- **Gemini API key** — Only if you want interview-prep generation (`GEMINI_API_KEY`).

## Environment variables

Create `.env.local` in the project root (Drizzle Kit also loads it via `drizzle.config.ts`).

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Postgres connection string for the app and Drizzle CLI. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Firebase config. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client Firebase config. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client Firebase config. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client Firebase config. |
| `FIREBASE_PROJECT_ID` | Admin SDK. |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK. |
| `FIREBASE_PRIVATE_KEY` | Admin SDK (escape newlines as `\n` in the env file if needed). |
| `GEMINI_API_KEY` | Optional; AI interview prep in `src/actions/gemini.ts`. |
| `RAPIDAPI_KEY` | Required for Job Finder JSearch API calls. |
| `JSEARCH_HOST` | RapidAPI host for JSearch (for example `jsearch.p.rapidapi.com`). |

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure `.env.local` as above.

3. Apply the database schema. With `DATABASE_URL` set, you can sync the schema to your database using Drizzle Kit (typical for local dev):

   ```bash
   npx drizzle-kit push
   ```

   Alternatively, run the SQL migration files under `drizzle/` against your database in the order recorded in `drizzle/meta/_journal.json` if you prefer explicit migrations.

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to sign-in; the root path routes you according to session and profile state.

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js development server with hot reload. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build (run `build` first). |
| `npm run lint` | ESLint over the project. |
| `npm run lint:fix` | ESLint with `--fix`. |
| `npm run format` | Prettier, write mode. |
| `npm run format:check` | Prettier, check only (useful in CI). |
| `npm run test` | Jest with jsdom and Testing Library (`jest.config.ts`, `jest.setup.ts`). |

Drizzle Kit is available via `npx` (for example `npx drizzle-kit push`, `npx drizzle-kit studio`) using `drizzle.config.ts` and `DATABASE_URL`; there is no dedicated `db:*` script in `package.json`.

## Testing

Component and action-adjacent tests live next to features under `*.test.tsx`. Run the full suite with `npm run test`.

## Tech stack summary

Next.js 16, React 19, TypeScript, Tailwind CSS 4, PostgreSQL, Drizzle ORM, Firebase Authentication (session cookie pattern), Google GenAI (`@google/genai`), Formik, Yup, Zod, `@dnd-kit`, Recharts, Sonner, Jest, and Testing Library.
