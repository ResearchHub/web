# API Integration Context

About ResearchHub (the platform we are building):

- ResearchHub is a web app that intends to incentivize scientists with ResearchCoin (ERC20 token) when they engage in "good" science practices (e.g. peer review, publishing openly, etc.)
- ResearchHub has a strong social network aspect, where users can follow each other and see each other's activity as wee as discover new content
- ResearchHub is built on Django (backend) and Next.js (frontend).

Project goals:

- Migrate from old Next.js app to new version when improved UI/UX and new components/features
- Maintain connection to existing Django backend

## Reference Paths

All paths are relative to the root of the project.

- Publicly facing pages: `app/`
- UI components: `components/ui`
- Django API: `external_references/django-app`
- Old Next.js app (we are migrating from this): `external_references/old-nextjs-app`
- Django API endpoints: `external_references/django-app/src/urls.py`
- Modals should be added in `components/modals`
- Services should be added in `services`

## Auth

- Next.js app is using Auth via next-auth
- Django API does not use JWT but it does return a token in the response of the login endpoint
- app/api/auth/[...nextauth]/route.ts is the file that handles the authentication

## Services

- Services are located in `services` directory
- Services are used to interact with the Django API
- DTO transformer functions are located in `services/types` directory and are used to transform response data from the Django API into app-usable types.

## Layout and conventions

- `app/layouts/PageLayout.tsx` is the main layout file for the app
- `app/layouts/TopBar.tsx` is the top bar component for the app
- Every new page should be wrapped with `app/layouts/PageLayout.tsx` and have a three column layout. Initialize `RightSidebar` to be empty.

## Contexts

- Contexts including data providers should be located in `contexts` directory

## Other

- Utility functions are located in `utils` directory
- Date functions are located in `utils/date.ts`

## Main Feed

- `components/Feed/Feed.tsx` is the main feed component
- Feed item types are fetched from the /feed endpoint
- actions are: publish, repost, post, contribute
- types are: grant, paper, review, comment, contribution

## Directives

- Use next/Link component whenever rendering a component that redirects to another page
- Use `components/ui/Tabs` component whenever rendering a horizontal navigation
- Use `components/ui/Button` component whenever rendering a button. do not use `<button>` tags.
- Refactor rather than adding new code when possible
- All functions created should include parameter destructuring in the function signature

## Technologies used in the project (next.js)

- TypeScript
- React
- Next.js
- TailwindCSS
- TipTap
- next-auth
- headlessui
- react-hot-toast
- lucide-react
- FontAwesome
- dayjs
- We use node v20.16.0

# Directives when creating new code (Very important)

Execute the following whenver you are creating new code:

- Create human readable code
- Test for scalability
- Test for performance
- Test for security
- Test for maintainability
- Test for readability
