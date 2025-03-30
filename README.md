# ResearchHub Web

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Development Requirements

- Node.js
- Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for VS Code

### TypeScript and Code Quality

This project uses strict TypeScript configuration and enforces code quality through pre-commit hooks:

- All TypeScript files are checked for type errors
- Code is automatically formatted with Prettier
- ESLint runs to catch potential issues
- Commits will be blocked if there are any TypeScript errors or linting issues

> Note: Pre-commit hooks are automatically installed when you run `npm install`. No manual setup is required.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Feature Flags

This project includes a feature flag system for enabling/disabling features in different environments:

- Feature flags are managed in `utils/featureFlags.ts`
- Features are automatically disabled in production unless explicitly configured otherwise
- Use `isFeatureEnabled('featureName')` to check if a feature is available in the current environment
- Debug feature flag status with `printFeatureStatus()` in browser console
- Add new features by extending the `FeatureFlags` object in the file

When adding new experimental features, always wrap them in feature flags to control deployment across environments.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## UI Components

### Icons

The project includes a comprehensive icon system with a variety of icons for different purposes:

- **Analytics Icons**: `upChart1`, `upChart2`, `gauge`
- **Interactive Icons**: `settings`, `comment`, `upvote`, `report`, `lightening`, `solid`
- **Solid Icons**: `solidHand`, `solidNotebook`, `solidCoin`, `solidBook`
- **Wallet Icons**: `wallet1`, `wallet2`, `wallet3`, `wallet5`, `wallet6`
- **Home Icons**: `home1`, `home2`, `home3`
- **Fund Icons**: `fund`, `fund2`, `fundYourRsc`, `fundYourRsc2`, `fundYourRscText`
- **RSC Icons**: `rscVector`, `rscBlueVector`, `rscGoldVector`, `rscIcon`, `rscBlue`, `rscGold`, `rscGold2`, `rscGrey`, `rscBold1`, `rscBold2`
- And many more...

To use an icon in your component:

```tsx
import { Icon } from 'components/ui/icons/Icon';

// Regular icon
<Icon name="settings" size={24} />

// Colorized icon
<Icon name="upvote" size={32} color="#F2A900" />

// Bold RSC icon with color
<Icon name="rscBold1" size={32} color="#3971FF" />

// Solid icon
<Icon name="solidBook" size={32} />
```

For examples, see `components/ui/icons/IconExamples.tsx`.

### Navigation

The navigation component uses solid icon variants for selected navigation items:

- When a navigation item is not selected, it displays the regular icon variant
- When a navigation item is selected/active, it displays the solid icon variant
- This provides a clear visual indication of the current navigation state

The mapping between regular and solid icons is defined in the Navigation component:

| Navigation Item | Regular Icon | Solid Icon (Selected) |
| --------------- | ------------ | --------------------- |
| Earn            | earn1        | solidCoin             |
| Fund            | fund         | solidHand             |
| Journal         | rhJournal1   | solidBook             |
| Notebook        | labNotebook2 | solidNotebook         |

To see this in action, visit the `/icontest` route in the application.
