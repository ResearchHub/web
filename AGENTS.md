# ResearchHub Web

Next.js frontend for ResearchHub. All data comes from the Django API in
`researchhub-backend`, reached through `NEXT_PUBLIC_API_URL`.

## Checks

- Run `npm run lint` and `npm run type-check` before finishing.
- The pre-commit hook runs Prettier, ESLint, and a full type-check, so a commit
  fails on a type error anywhere in the repo.
- The Playwright smoke tests in `smoke/` are the only test suite. They run
  against a running environment (see `README.md`).
- Add tests only when the user asks for them.
- If a change adds network requests (a new API call, or an existing call made
  more often), call it out prominently in the summary to the user: say which
  endpoints, where they are triggered, and why the data could not come from an
  existing response.

## Dependencies

- `@tiptap-pro/*` and Font Awesome Pro install from private registries. Their
  tokens live in a gitignored `.npmrc` at the repo root, so a fresh clone or git
  worktree needs a copy of it before `npm install` works.
- Use npm 11 for `npm install` and `npm ci`.

## Conventions

- Data flows component → hook → service → `ApiClient` (`services/client.ts`),
  which attaches the auth token and throws `ApiError`. Services are
  `services/*.service.ts` classes of static methods.
- The API returns snake_case. Each domain file in `types/` defines the camelCase
  model and a `transform*` function built with `createTransformer`
  (`types/transformer.ts`), which keeps the original payload on `.raw`. Services
  return transformed models.
- Keep services and transformers to data; display formatting belongs in
  components.
- When possible and reasonable, prefer updating an API endpoint to include the
  data a view needs over making additional network requests to other endpoints
  to fetch it.
- `app/layouts/PageLayout.tsx` is the standard page shell.
- Build UI from `components/ui/` (`Button`, `Tabs`, `BaseModal`, ...) and merge
  class names with `cn()` from `utils/styles.ts`. Modals go in
  `components/modals/`.
- Icons come from `lucide-react` by default.
- Import with the `@/` alias.
