# InterviewIQ

AI-powered interview prep for executive (Director+) candidates. A conversational
mobile intake flow (resume, job description, interviewer profile, interviewer
role) feeds a research + generation pipeline that produces a grounded,
shareable, exportable interview prep report.

This is an **MVP prototype**: a single backend service (not a microservice
platform) and a React Native (Expo) app. See "Future work" below for what's
intentionally deferred.

## Project structure

```
app/                 Expo React Native app (Expo Router, NativeWind, Zustand)
server/              Node/TypeScript backend (Express, Drizzle/Postgres)
packages/shared/     TypeScript types shared between app and server
```

## Prerequisites

- Node.js 20+ (tested on Node 24)
- Docker Desktop, running (for local Postgres)
- Expo Go app, or an iOS/Android simulator — or just a browser, see below
- An Anthropic and/or OpenAI API key (for the AI pipeline)

## Setup

```bash
npm install
cp .env.example .env
cp .env.example server/.env   # dotenv loads from the server's own cwd
# fill in ANTHROPIC_API_KEY (and/or OPENAI_API_KEY) in server/.env

npm run db:up          # starts Postgres (+ Adminer on :8081) via Docker
npm run migrate         # applies Drizzle migrations
npm run dev:server      # starts the backend on :4000
```

In a second terminal:

```bash
npm run dev:app         # starts Expo
```

Then either open the Expo Go app / an iOS or Android simulator, **or** press
`w` (or run `npx expo start --web` from `app/`) to open it in a browser —
useful for quick iteration without a simulator, though native-only features
(native share sheet, secure token storage, native file download) fall back to
web-appropriate equivalents (clipboard copy, browser file download) rather
than exercising the real native path. See `app/src/api/authToken.ts` and
`app/app/report/[reportId]/index.tsx` for where those fallbacks live.

## Environment variables

See [.env.example](.env.example). Key ones:

- `LLM_PROVIDER` selects `anthropic` or `openai` — the AI pipeline is written
  against a provider-agnostic interface (`server/src/llm/types.ts`), so
  switching providers is a one-line env change with no pipeline code changes.
- `PUBLIC_BASE_URL` is used to build share links and **must point at the app**
  (the Expo dev server, e.g. `http://localhost:8082`), not the backend API —
  `/share/:token` on the backend returns raw JSON, not a page. In production
  this should be a proper universal-link domain with iOS Associated Domains /
  Android App Links configured so the link opens the native app directly;
  that infra isn't built in this MVP pass, but `app/app/share/[token].tsx`
  is ready to be the landing target once it exists.

## Manual end-to-end test

1. `npm run db:up && npm run migrate && npm run dev:server`
2. `npm run dev:app`, open a simulator (or a browser — see above)
3. Sign up, then walk the 4-step intake flow (upload/paste a resume, paste a
   job description, paste an interviewer LinkedIn URL or profile text — or
   skip that step, enter the interviewer's role)
4. Watch the processing screen complete (real LLM + web search calls; expect
   roughly 1.5–3 minutes for all 6 sections)
5. Expand/collapse all 6 report sections; confirm citations and "(inferred)"
   labels render; confirm restarting the app mid-intake resumes at the right
   step instead of restarting from step 1
6. Tap Share, confirm a share link is produced and opens a view-only report
   (no edit/share/export controls) in a separate, unauthenticated session
7. Tap Export PDF, confirm a well-formatted, print-ready PDF downloads
   covering all 6 sections

## Future work (explicitly out of scope for this build)

Kubernetes manifests/HPA, Stripe billing, a separate admin console, a full
observability stack (Sentry/Prometheus/Grafana), SSO/MFA, DOCX export,
splitting the backend into microservices, CI/CD pipelines, and a real
universal-link domain for share links. The `server/src/llm/`,
`server/src/pipeline/`, and `server/src/modules/` boundaries and the
`packages/shared` types are structured so these can be layered on later
without a rewrite.
