# Funding UX — Summary of Changes

## 1. Unified `getShortTitle` utility

**File:** `components/Funding/GrantCarousel.tsx`

- Extended the existing `getShortTitle(title)` to accept an optional `maxWords` parameter
- Strips the "Request for Proposals" prefix **then** truncates to N words when `maxWords` is provided
- Without `maxWords`, behaves exactly as before (backward compatible)
- Eliminates the duplicate `getShortTitle` that existed in `FundingTabs.tsx` (which had a bug — it truncated to 3 words _without_ stripping the prefix, so tabs could show "Request for Proposals" as the label)

## 2. `Tabs` component — added `size` prop

**File:** `components/ui/Tabs.tsx`

- Added a `size` prop (`xs | sm | md | lg`) that maps to Tailwind text size classes
- Defaults to `sm` for full backward compatibility
- Replaces the previously hardcoded `text-sm` on all tab items

## 3. `FundingTabs` cleanup and shared `buildGrantTabs`

**File:** `components/Funding/FundingTabs.tsx`

- Removed duplicate `getShortTitle` and `formatCompactAmount` functions
- Imports unified `getShortTitle` from `GrantCarousel`
- Exported `buildGrantTabs()` — shared between `FundingTabs` and `TopBar` (DRY)
- Fixed tab hrefs from `/funding/${id}` (404) to `/grant/${id}/${slug}` (correct route)
- Uses `size="md"` for 16px tab text
- Calls `ensureLoaded()` to trigger lazy grant fetch

## 4. `GrantContext` — lazy loading + optional hook

**File:** `contexts/GrantContext.tsx`

- Added `ensureLoaded()` to the context — consumers call it to trigger the initial API fetch on-demand instead of auto-fetching on every mount
- Added `useGrantsOptional()` — returns `null` safely outside the provider, used by TopBar which renders on all pages
- Changed default `isLoading` to `false` so the global provider doesn't show loading state on non-funding pages

## 5. Hoisted `GrantProvider` to global providers

**File:** `components/providers/ClientProviders.tsx`

- Added `GrantProvider` to the global provider tree so it's accessible from TopBar on all pages
- Zero overhead on non-funding pages — no API call is made until `ensureLoaded()` is called
- The nested `GrantProvider` in `FundingPageContent` still provides SSR-hydrated grants for the page content (React uses nearest provider)

## 6. Grant tabs in TopBar — Coinbase-style second row

**File:** `app/layouts/TopBar.tsx`

- On `/funding` and `/funding/proposals` routes, renders a second row of scrollable grant tabs below the title/subtitle
- Uses the `Tabs` component with built-in horizontal scroll and gradient-faded chevron arrows
- "All" tab is included and selected by default
- Active tab underline rides on the dividing border via `-mb-px`
- Title row height reduced from 70px to 58px on funding pages to tighten spacing
- FeedTabs suppressed on funding pages (`!isFundingPage`) to avoid duplication
- Subtitle remains visible (tabs are below, not inline)

## 7. PageLayout — dynamic offsets for taller TopBar

**File:** `app/layouts/PageLayout.tsx`

- Detects funding pages via `hasFundingTabs` (pathname check)
- Adjusts `padding-top` on the content area to accommodate the taller TopBar (94px normal, 78px compact)
- Adjusts left sidebar and right sidebar `top` offsets to match

## 8. Removed redundant tabs from funding page

**File:** `app/funding/FundingPageContent.tsx`

- Removed `FundingPageTabs` ("Opportunities | Proposals") since the tabs now live in the TopBar
