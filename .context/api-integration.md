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
- Symlinks established
- Ready for API integration 
- Ready for Auth integration

Auth integration:
- Old app uses LoginModal component in `external_references/old-nextjs-app/components/Login/LoginModal.tsx` to integrate with these API auth endpoints
- We need to integrate with these endpoints in the new app
- Users should be able to login/signup with their email or google provider
- UX should be similar to old app but simplified when possible
- We should support YOLO login

