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



## Layout
- `app/layouts/PageLayout.tsx` is the main layout file for the app
- `app/layouts/TopBar.tsx` is the top bar component for the app
- Most pages have a three column layout

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

## Current Status
[x] Integrate Django API with Next.js via services directory completed
[x] Auth integration completed via next-auth
[ ] YOLO integration not in place
[ ] Need to integrate with endpoint to fetch notifications and render them in /notifications endpoint


