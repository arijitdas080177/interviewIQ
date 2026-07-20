# InterviewIQ

AI-powered interview prep for executive (Director+) candidates. A conversational
mobile intake flow (resume, job description, interviewer profile, interviewer
role) feeds a research + generation pipeline that produces a grounded,
shareable interview prep report.

This is an **MVP prototype**: a single backend service (not a microservice
platform) and a React Native (Expo) app. See "Future work" below for what's
intentionally deferred.

## Project structure

```
app/                 Expo React Native app
server/               Node/TypeScript backend (Express, Drizzle/Postgres)
packages/shared/      TypeScript types shared between app and server
```

## Prerequisites

- Node.js 20+ (tested on Node 24)
- Docker (for local Postgres)
- Expo Go app or an iOS/Android simulator
- An Anthropic and/or OpenAI API key (for the AI pipeline)

## Setup

```bash
npm install
cp .env.example .env
# fill in ANTHROPIC_API_KEY / OPENAI_API_KEY in .env

npm run db:up          # starts Postgres (+ Adminer on :8081) via Docker
npm run migrate         # applies Drizzle migrations
npm run dev:server      # starts the backend on :4000
```

In a second terminal:

```bash
npm run dev:app         # starts Expo; press i/a to open a simulator
```

## Environment variables

See [.env.example](.env.example). `LLM_PROVIDER` selects `anthropic` or
`openai` — the AI pipeline is written against a provider-agnostic interface
(`server/src/llm/types.ts`) so switching providers is a one-line env change.

## Manual end-to-end test

1. `npm run db:up && npm run migrate && npm run dev:server`
2. `npm run dev:app`, open a simulator
3. Sign up, then walk the 4-step intake flow (upload/paste a resume, paste a
   job description, paste an interviewer LinkedIn URL or profile text, enter
   the interviewer's role)
4. Watch the processing screen complete (real LLM + web search calls, expect
   ~30-90s)
5. Expand/collapse all 6 report sections; confirm citations and "(inferred)"
   labels render
6. Generate a share link and open it in an unauthenticated session
7. Export the report as PDF

## Future work (explicitly out of scope for this build)

Kubernetes manifests/HPA, Stripe billing, a separate admin console, a full
observability stack (Sentry/Prometheus/Grafana), SSO/MFA, DOCX export,
splitting the backend into microservices, and CI/CD pipelines. The
`server/src/llm/` and `server/src/pipeline/` module boundaries and the
`packages/shared` types are structured so these can be layered on later
without a rewrite.
