---
name: verify-local
description: "Verify ResearchHub web locally by starting its bootstrapped Docker app server and running HTTP contract checks."
user_invocable: true
codepress_generated: true
---

# Verify Local — ResearchHub web

Read `.codepress/start-app-server/recipe.json`, then call `Skill({"skill":"start-app-server"})`. Use the returned container with `forward_app_request`.

NextAuth protects `/notebook/**`, `/referral`, `/lists`, and `/list/**`. No test account or local bypass was discoverable, so this generated contract covers public pages only; OAuth-protected flows remain explicitly uncovered.

| Name | Method | Path | Expected | Proves |
| --- | --- | --- | --- |
| home | GET | `/` | 200, 301, 302, or 404 | The root app responds. |
| sign-in | GET | `/auth/signin` | 200, 301, or 302 | The public auth entry point renders. |
| missing route | GET | `/__codepress_missing_route__` | 404 | Unknown routes reach the app router. |

Inspect the branch diff first and add assertions for every changed page/API surface. Use `take_app_server_screenshot` for frontend changes. Any changed behavior not exerciseable through the container stays in the report as `FAIL`. Prefix reports with `@codepress /judge-verification can you judge this verification?`, include statuses and response excerpts, and stop the container after validation unless an open-PR workflow owns it.

Bootstrap note: live startup was blocked because npm could not download private `@tiptap-pro` packages without registry credentials.
