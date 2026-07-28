# Emporva Web

Emporva is a home management platform that connects homeowners, contractors, and property managers. This repo contains the web application: a React single-page app plus the Vercel serverless functions that back it (Stripe billing, transactional email, document AI, team invites, and lead capture).

The conversational AI diagnostics agent lives in a separate repo (`emporva_ai_agent`) and is consumed here via `VITE_AI_AGENT_URL`.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Vercel serverless functions (`api/`, ESM TypeScript) |
| Database / auth / storage | Supabase (Postgres + RLS, Auth, private Storage buckets) |
| Payments | Stripe (subscriptions, checkout, customer portal, webhooks) |
| CMS | Storyblok (marketing pages, blog, services, FAQs) |
| Email | SendGrid |
| Document AI | OpenAI (gpt-4o / gpt-4o-mini) via the API functions |

## Getting started

Prerequisites: Node 18+ and npm.

```bash
npm install
cp .env.example .env   # then fill in values
npm run dev            # http://localhost:5173
```

`npm run dev` serves the SPA **and** the serverless functions: a small plugin in `vite.config.ts` maps `POST /api/<path>` to the matching `api/<path>.ts` default export, so Stripe, email, and AI endpoints work locally without the Vercel CLI. Note the local plugin only handles `POST` requests.

### Environment variables

Client-side (must be prefixed `VITE_`, safe to expose):

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Supabase project + anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_STORYBLOK_TOKEN` | Storyblok preview/public token |
| `VITE_AI_AGENT_URL` / `VITE_AI_AGENT_API_KEY` | The emporva_ai_agent service |
| `VITE_SITE_URL` | Canonical site URL |

Server-side (used only inside `api/`; set in Vercel project settings, never exposed to the browser):

| Variable | Purpose |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS for server-side reads/writes and private-bucket downloads |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe API + webhook signature verification |
| `STRIPE_PRICE_HOMEOWNER_PREMIUM_MONTHLY` / `..._ANNUAL` / `STRIPE_PRICE_CONTRACTOR_PREMIUM` | Stripe price IDs |
| `OPENAI_API_KEY` | Document/image AI endpoints |
| `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` | Transactional email |
| `EARLY_ACCESS_NOTIFY_EMAIL` | Internal notification address for new leads |
| `SITE_URL` | Absolute URL used in emails and Stripe redirects |

For local dev, everything can live in `.env` — `vite.config.ts` loads all values into `process.env` so the API plugin can read the server-side ones too.

## Project structure

```
api/                    Vercel serverless functions (ESM — relative imports need .js extensions)
  _lib/                 Shared helpers: supabase/auth, stripe, sendgrid, email templates, intake
  stripe/               Checkout, payment intents, portal, subscription management, webhook
  intake/               Smart Intake: AI document classification + filing
  team/                 Contractor team-member invites
  email/, early-access/, newsletter/
  analyze-document.ts, ask-document.ts, analyze-image.ts, analyze-utility-bill.ts,
  generate-diy-plan.ts, generate-renovation.ts
database/
  schema.sql            Reference dump of the full schema
  migrations/           Numbered SQL migrations (see below)
src/
  pages/                One folder per route (lazy-loaded via src/router/config.tsx)
  components/           base/ (primitives), feature/ (cross-page features), layout/
  services/             Typed fetch wrappers for the api/ functions
  contexts/, hooks/, lib/, utils/, i18n/
storyblok/              Component schemas + seed scripts for the CMS space
```

## Users and dashboards

Four roles, resolved after login by `src/hooks/useRoleRoutes.ts`:

- **Homeowner** — Core and Premium dashboards (`/homeowner-dashboard-core`, `-premium`): systems profile, seasonal tasks, DIY task board, document vault, Smart Intake.
- **Contractor** — Core and Premium dashboards: jobs, quotes, calendar, team members.
- **Multi-unit** (property manager) — Core and Premium dashboards.
- **Team member** — invited by a contractor, gets a scoped dashboard of assigned work.

Public marketing pages (home, services, blog, FAQs, early access) are driven by Storyblok content.

## Key features

- **Smart Intake** — homeowners drop any document (manual, receipt, warranty, insurance, permit) on the dashboard; `api/intake/classify.ts` reads it with gpt-4o and suggests where it belongs, `api/intake/file.ts` files it into the Systems Profile or Document Vault with extracted insights persisted. The Systems tab's "Build from Document" flow uses the same endpoints to create a full system record (brand, model, install year, lifespan) from an uploaded document.
- **Document AI** — per-system document analysis (`analyze-document.ts`) and Q&A over uploaded documents (`ask-document.ts`).
- **Billing** — Stripe subscriptions for Premium plans, with webhook + `verify-checkout-session` reconciliation (shared logic in `api/_lib/stripeSync.ts`).
- **Team invites** — contractors invite team members via Supabase admin invite emails (`api/team/invite.ts`).

## Database migrations

Migrations in `database/migrations/` are **applied manually** in the Supabase SQL editor, in numeric order. There is no migration runner. Conventions:

- Never renumber or edit an already-applied migration; add a new numbered file instead.
- Write migrations idempotently where possible (`if not exists`, `drop policy if exists` + `create`).
- All user-facing tables use RLS scoped to `auth.uid()`; file storage uses private buckets gated on the first path folder being the user's id.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + local API function handling |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | `tsc --noEmit` over the app (`tsconfig.app.json`) |
| `npm run lint` | ESLint over `src/` |
| `npm run storyblok:*` | Pull/push Storyblok component schemas and seed content |

## Deployment

Deployed on Vercel. `vercel.json` sets the SPA rewrite (everything except `/api/*` falls through to `index.html`) and the security headers (CSP, HSTS, frame denial). Pushes to `development` deploy the development environment.

Because the project is `"type": "module"`, **relative imports inside `api/` must include the `.js` extension** (`import { getAuthUser } from '../_lib/auth.js'`) or the function crashes at cold start with `ERR_MODULE_NOT_FOUND`.
