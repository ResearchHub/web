# AGENTS.md

Orientation for AI coding agents working in this repository.

**Read [`docs/glossary.md`](docs/glossary.md) first.** ResearchHub carries a lot of domain jargon —
RFPs, proposals, preregistrations, unified documents, bounties, RSC — and much of it does not mean
what it sounds like. The glossary defines every term with the file that owns it.

## What this is

The ResearchHub web app: a Next.js 16 App Router frontend in TypeScript, talking to a separate
Django REST API. ResearchHub is an open-science platform that rewards researchers with
ResearchCoin (RSC) for peer review, open publishing, and funding work.

This repo contains only the frontend. The backend lives elsewhere; treat its API as a fixed
contract you read from, not something you can change.

## Commands

| Command                   | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `npm run dev`             | Dev server                                                           |
| `npm run type-check`      | `tsc --noEmit` — run this after any change                           |
| `npm run lint`            | ESLint across the repo                                               |
| `npm run lint:work-pages` | The `researchhub/work-document-tracking` rule on work document pages |
| `npm run format`          | Prettier                                                             |
| `npm run test:smoke`      | Playwright smoke suite                                               |

`npm install` needs an `.npmrc` with credentials for two private registries — Tiptap Pro
(`@tiptap-pro`) and FontAwesome Pro (`@fortawesome`, `@awesome.me`). The file is gitignored; see
`.github/workflows/smoke.yml` for the exact contents CI writes. `.nvmrc` pins Node 22, though CI
installs on Node 20.

The pre-commit hook runs `lint-staged`, which formats staged files, applies `eslint --fix`, and
runs a full `npm run type-check`. Expect commits to be slow, and do not use `--no-verify`.

CI runs only the smoke suite and a branch mirror. Lint, type-check, and build are not gated by
GitHub Actions, so verify them locally.

## Layout

| Path                                      | Contents                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `app/`                                    | App Router routes, plus shared page chrome in `app/layouts/`                       |
| `components/`                             | `components/ui/` design-system primitives; every other directory is a feature area |
| `services/`                               | One `*Service` class per Django domain, all going through `ApiClient`              |
| `types/`                                  | Domain models _and_ their `transform*` functions                                   |
| `hooks/`, `contexts/`                     | Client state — one hook per file, one context per feature                          |
| `utils/`, `lib/`, `constants/`, `config/` | Helpers, server-only helpers, constants                                            |
| `smoke/`                                  | Playwright specs                                                                   |
| `.cursor/rules/`                          | Architecture guides per layer, worth reading before a large change                 |

Import with the `@/` alias (`~/` also resolves to the root). `store/` holds static and mock data,
not global state.

## Conventions that will trip you up

**Every API payload is transformed.** Django returns snake_case; the app consumes camelCase domain
models. Add a `transform*` function in `types/` built with `createTransformer`, which preserves the
original payload as `.raw`. Never leak raw API shapes into components.

**All HTTP goes through `ApiClient`** (`services/client.ts`), a static class that attaches the
Django token as `Authorization: Token <token>`. Use `get` for authenticated reads and `getPublic`
for anonymous ones. There is no `BaseService`, no `fetchWithAuth`, and no lowercase `apiClient`
instance.

**List endpoints are DRF-paginated:** `{ count, next, previous, results }`. `next` is an absolute
URL you can pass straight back to `ApiClient.get`.

**Data fetching is plain async code.** No React Query for app data (it appears only inside
`contexts/OnchainContext.tsx` for wallet state) and no Server Actions anywhere. Server Components
call services directly; client components call them from hooks.

**State has no store library.** Reach for local state, then a hook in `hooks/`, then a context in
`contexts/` mounted from `components/providers/ClientProviders.tsx`, then URL params. Do not add
Redux or Zustand.

**Compose Tailwind classes with `cn()`** from `utils/styles.ts`, and use `cva` for multi-variant
components. Use `components/ui/Button`, not a bare `<button>`; use `components/ui/Tabs` for
horizontal navigation; use `next/link` for internal navigation.

**Work document pages must render `<WorkDocumentTracker work={...} metadata={...} tab="..." />`.**
The `researchhub/work-document-tracking` ESLint rule enforces this on
`app/{paper,post,proposal,question,report}/[id]/[slug]/**/page.tsx`, and it is the only custom rule
in the config.

**Money is dual-currency.** Amounts usually arrive as `{ usd, rsc }`. For historical totals prefer
the stored `rscUsdSnapshot` over the live rate from `useExchangeRate()`, and for completed
fundraises use `computeGoalRate` so displayed totals match the goal.

**Two comment content formats coexist.** Comments carry a `ContentFormat` of `QUILL_EDITOR` or
`TIPTAP`. New content is TipTap, but legacy Quill content must keep rendering.

**Names are reused across modules.** `ContentType`, `DocumentType`, `CommentType`, `Contribution`,
`Author`, `useComments`, and `transformUnifiedDocument` each mean different things in different
files. Check the import path — the glossary lists every collision.

**Lots of stock lint rules are disabled**, including `react-hooks/exhaustive-deps`,
`@typescript-eslint/no-explicit-any`, and `prefer-const`. A clean `npm run lint` does not mean the
code is idiomatic; match the surrounding style instead.

## Before you finish

Run `npm run type-check` and `npm run lint`. Smoke tests need a running environment plus
`SMOKE_BASE_URL`, `SMOKE_USER_EMAIL`, and `SMOKE_USER_PASSWORD` (see `README.md`), so they are not
always runnable locally.
