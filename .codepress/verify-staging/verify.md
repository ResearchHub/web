# Staging verification

This repository did not contain a staging deploy script, cloud configuration, health URL, or deployment credentials at bootstrap time.

The generated toolbox contains Node.js 22, bash, curl, git, and jq. Its current command runs `npm ci && npm run build` as a safe production-build check; it does not deploy or contact a staging environment. No credentials are requested.

To enable real staging verification, replace `deploy_command`, add the required toolbox tools and non-AWS Agent Vault secret mappings, set `health_check.url`, and expand `verification_contract` with real deployed HTTP routes. Do not add secrets to this file or to `recipe.json`.
