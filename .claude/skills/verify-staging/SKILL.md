---
name: verify-staging
description: "Verify ResearchHub web on staging using the repo-owned verification toolbox and contract."
user_invocable: true
codepress_generated: true
---

# Verify Staging — ResearchHub web

Read `.codepress/verify-staging/recipe.json` and require `schema_version === 1`. Load `run_toolbox_command` with `search_tools(query="deploy toolbox app server")` if needed.

No staging deployment command, cloud target, health URL, or deployment credentials were present at bootstrap. The recipe is marked `blocked-no-deployment-target` and currently runs only `npm ci && npm run build`; never report that as a successful staging deployment.

Run the repo-owned toolbox with the recipe values. A non-zero command is FAIL with stdout/stderr excerpts. A successful build is PASS for the build check but the overall staging result remains BLOCKED because there is no deployed environment to health-check or query. Do not invent a namespace, URL, credentials, or deployment command.

When a real target is added, update the recipe and `verify.md` with the deploy contract, then add branch-specific HTTP assertions and frontend QA against the real staging URL. Reports begin with `@codepress /judge-verification can you judge this verification?` and include the live PR head SHA plus an explicit BLOCKED verdict while no target exists.
