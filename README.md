# ResearchHub Web

The ResearchHub web application running on Next.js

## Development Requirements

- Node.js
- Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for VS Code
- Run `npm run dev` to start the app

## Smoke tests

Playwright tests in `smoke/` run against an already-running environment. Set `SMOKE_BASE_URL`,
`SMOKE_USER_EMAIL` and `SMOKE_USER_PASSWORD` in `.env.development` first — see `.env.example`.

```bash
npm run test:smoke                       # headless
npm run test:smoke:ui                    # interactive UI mode

npx playwright test smoke/feed.spec.ts   # a single file
npx playwright show-report               # report from the last run

# point it somewhere else for one run
SMOKE_BASE_URL=https://staging.researchhub.com npm run test:smoke
```
