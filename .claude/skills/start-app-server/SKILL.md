---
name: start-app-server
description: "Start the ResearchHub web app server in Docker and validate it responds."
user_invocable: true
codepress_generated: true
---

# Start App Server — ResearchHub web

Read `.codepress/start-app-server/recipe.json`. Compare the full output of `git hash-object Dockerfile` and `git hash-object package.json` with its checksums and report drift. Resolve every key in `required_vault_keys`; `NPM_TOKEN` is a private Tiptap registry credential and must never be written to the recipe or committed files. Build with the repository's configured BuildKit npmrc secret (or equivalent secret mechanism); the Dockerfile installs with `npm ci --ignore-scripts`, runs as the non-root `node` user, and copies only declared application directories/files. Then call `build_and_start_app_server` with the repo root, port `3000`, `dockerfilePath: "Dockerfile"`, and the recipe's `static_env_vars`. Validate with `forward_app_request(containerId=<id>, path="/", method="GET")`; accept 200, 301, 302, or 404. Return the container ID and result, leaving the container running unless asked to stop it.

This is a Next.js 15 App Router app using npm. No local database or cache service is declared. Pages that fetch backend data may need an environment-specific `NEXT_PUBLIC_API_URL`; do not store that secret or endpoint in the recipe.
