---
name: pr-screenshot
description: "Capture and attach frontend screenshots and videos to pull requests for ResearchHub web. Auto-triggers when creating a PR with UI changes. Uses the containerized Next.js app and the CodePress screenshot proxy."
user_invocable: true
codepress_generated: true
---

# PR Screenshots — ResearchHub web

Use this skill whenever a pull request changes rendered UI in `app/`, `components/`, `contexts/`, `styles/`, `public/`, or shared UI utilities.

## Capture map

| Changed files | Page | URL |
| --- | --- | --- |
| `app/page.tsx`, shared components | Home | `/` |
| `app/auth/**`, `components/Auth/**` | Sign-in | `/auth/signin` |
| `app/settings/**` | Settings | `/settings` |
| `app/(feed)/**` | Feed | `/latest` or `/popular` |
| `app/paper/**` | Paper | `/paper` or the changed paper URL |
| `app/post/**` | Post | `/post` or the changed post URL |
| `app/leaderboard/**` | Leaderboard | `/leaderboard` |
| `app/journal/**` | Journal | `/journal` |

Use the most specific route available. Capture a screenshot for static changes and a video for interactions or animations.

## Container capture

```text
build_and_start_app_server(workspaceDir=<repo root>, port=3000, dockerfilePath="Dockerfile", envVars={"NEXT_PUBLIC_SITE_URL":"http://localhost:3000","NEXT_PUBLIC_VERCEL_ENV":"preview"})
take_app_server_screenshot(containerId=<id>, path="/", viewport={"width":1440,"height":1100}, full_page=false, wait_ms=1500)
stop_app_server(containerId=<id>)
```

Use `route_mocks` for external API calls when no development API is available. NextAuth protects `/notebook/**`, `/referral`, `/lists`, and `/list/**`; do not claim those routes are verified without a real test session.

## Playwright fallback

This repo uses npm and has no existing Playwright setup. If the screenshot proxy is unavailable, install `@playwright/test`, create `e2e/playwright.config.ts` with base URL `http://127.0.0.1:3000` and web server `npm run dev -- --hostname 0.0.0.0`, then run a temporary test that asserts `body` is non-empty and writes `/tmp/pr-screenshots/researchhub.png`. Remove the temporary test afterward.

Screenshots must use an explicit viewport, wait for feature content, exceed 10 KB, and be uploaded with `upload_pr_asset` before being attached to the PR.
