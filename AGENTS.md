# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

ResearchHub Web is a Next.js 15 frontend (React 18, TypeScript, TailwindCSS) for a scientific research social platform. It connects to a separate Django REST API backend (not in this repo). See `.context/api-integration.md` for architecture details.

### Private npm registries

This project depends on **@tiptap-pro** and **@fortawesome/pro-\*** packages which require private registry authentication. The `.npmrc` must exist in the project root with:

```
@tiptap-pro:registry=https://registry.tiptap.dev/
//registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=${FONTAWESOME_NPM_AUTH_TOKEN}
```

The environment variables `TIPTAP_PRO_TOKEN` and `FONTAWESOME_NPM_AUTH_TOKEN` must be injected as secrets. Without these, `npm install` will fail with 403/404 errors.

### Environment variables

A `.env.local` file is needed for the dev server. Key required vars:

- `NEXT_PUBLIC_API_URL` — Django backend URL (staging: `https://backend.staging.researchhub.com`)
- `NEXT_PUBLIC_WS_URL` — WebSocket URL (staging: `wss://backend.staging.researchhub.com`)
- `NEXT_PUBLIC_SITE_URL` — Local site URL (`http://localhost:3000`)
- `NEXTAUTH_SECRET` — Any random string for NextAuth session encryption
- `NEXTAUTH_URL` — Local URL (`http://localhost:3000`)

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (uses Turbopack, port 3000) |
| Lint | `npm run lint` |
| Type check | `npm run type-check` |
| Build | `npm run build` |
| Format | `npm run format` |

### Pre-commit hooks

Husky runs `lint-staged` on commit, which executes Prettier, ESLint, and `tsc --noEmit` on staged `.ts/.tsx` files. Husky is set up via `npm run prepare` (runs automatically after `npm install`).

### Node.js version

`.nvmrc` specifies Node 22. The VM has nvm with v22.22.0 pre-installed.
