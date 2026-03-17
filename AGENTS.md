# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

ResearchHub Web is a Next.js 15 frontend (React 18, TypeScript, TailwindCSS) for a scientific research social platform. It connects to a separate Django REST API backend (not in this repo). See `.context/api-integration.md` for architecture details.

### Private npm registries

This project depends on **@tiptap-pro** and **@fortawesome/pro-\*** packages which require private registry authentication. The `.npmrc` must exist in the project root (it is gitignored). Without it, `npm install` will fail with 403/404 errors.

### Environment files

Next.js loads `.env.development` automatically in dev mode (`npm run dev`). This file is gitignored. It contains API URLs, NextAuth config, and third-party service keys. The Django backend URL defaults to `http://localhost:8000` but the frontend renders gracefully without it (API calls fail but UI works).

### Important notes

- The `.env.development` is configured to use the **staging backend** (`https://backend.staging.researchhub.com`). All pages load real data from staging.
- The `@fortawesome` registry scope in `.npmrc` must use `https://npm.fontawesome.com/` for both `@fortawesome` and `@awesome.me` scopes.
- `NEXTAUTH_URL` is set to `https://staging.researchhub.com/` for staging OAuth callbacks. Google OAuth login requires this URL to match the authorized redirect URIs in the Google Cloud Console.

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
