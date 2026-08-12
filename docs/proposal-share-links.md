# Proposal Share Links — Frontend Implementation Plan

Frontend counterpart to backend PR [#3973](https://github.com/ResearchHub/researchhub-backend/pull/3973)
("Link Share"), which lets eligible users turn anonymous, expiring access to a
private proposal on and off.

---

## 1. Backend contract

### Managing the link

All three verbs live on one URL:

```
POST   /api/researchhub_unified_document/{unifiedDocumentId}/share_link/
DELETE /api/researchhub_unified_document/{unifiedDocumentId}/share_link/
```

| | POST | DELETE |
|---|---|---|
| Purpose | Turn sharing on | Turn sharing off |
| Success | `201` new token, `200` existing token, body `{ token, expires_at, created_date }` | `204`, no body |
| Ineligible caller | `403` | `403` |
| Not a proposal | `400` | `400` |
| Not moderation-approved | `400` | *allowed* — see below |
| Bad `pk` / missing doc | `404` | `404` |

DELETE is idempotent and returns `204` whether or not a link existed. The view
docstring says this is "so a toggle can call it without first checking", which
is exactly our use case.

DELETE removes the row rather than expiring it, so turning sharing back on later
mints a **different** token. A URL that was turned off can never come back to
life.

### Consuming the link

The token travels as the `st` query parameter and is honored on exactly two
endpoints:

```
GET /api/researchhubpost/{postId}/?st=TOKEN
GET /api/researchhub_unified_document/{unifiedDocId}/get_document_metadata/?st=TOKEN
```

### Eligibility

`_assert_can_manage` gates both POST and DELETE on the document being a
`PREREGISTRATION` and the caller being any one of:

- `user.is_moderator_or_editor()`
- Creator or author of **any version** of the proposal
- Creator of a grant the proposal applied to

POST additionally requires `unified_document.is_approved`. DELETE deliberately
does not, so sharing can still be turned off on a proposal that was later
declined.

### What this means for us

The frontend's job is small:

1. Carry `st` on the two GET requests above whenever it is present in the URL.
2. `POST` when the user turns the toggle on, `DELETE` when they turn it off.

Two properties do leak into our design and are called out where they apply:

- **Never POST on render.** Minting rotates an expired token, permanently
  retiring the URL already handed out. It must run on explicit user action only
  (§8.3).
- **Approval gates minting.** `resolve_unified_document_id` requires
  `status=APPROVED`, and `_assert_can_share` rejects anything else with a `400`.
  A proposal awaiting moderation cannot be shared, and an existing link stops
  working if the proposal is later declined (§8.2).

### What the token does *not* need to cover

Confirmed with the feature author: prior to this change, those two GET endpoints
were the **only** ones that restricted access based on a proposal's private
visibility. Everything else on the page — comment feeds, fundraise progress,
funders, nonprofit section — behaves for a share-link visitor exactly as it does
for an anonymous visitor to a public proposal today.

The `assertEqual(fundraise_response.status_code, 401)` assertion in
`test_share_link_does_not_expose_proposal_elsewhere` is a blanket authentication
requirement anonymous users hit on any proposal, not privacy gating introduced
by this feature.

**Consequence:** there is no graceful-degradation work in this plan. Verify
empirically (§9) rather than designing around it.

---

## 2. The constraint that drives the architecture

The proposal document route splits data fetching across a layout and five pages:

```
app/proposal/[id]/page.tsx                    redirect to canonical slug URL
app/proposal/[id]/[slug]/layout.tsx           header + sidebar + generateMetadata
app/proposal/[id]/[slug]/page.tsx             "paper" tab
app/proposal/[id]/[slug]/conversation/page.tsx
app/proposal/[id]/[slug]/reviews/page.tsx
app/proposal/[id]/[slug]/updates/page.tsx
app/proposal/[id]/[slug]/bounties/page.tsx
```

The layout independently fetches the work and, on failure, calls `notFound()`:

```46:58:app/proposal/[id]/[slug]/layout.tsx
export default async function ProposalSlugLayout({ params, children }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let work;
  try {
    work = await PostService.get(id);
  } catch {
    notFound();
  }
```

**Next.js layouts never receive `searchParams`.** Pages do — including their
`generateMetadata` — because pages re-render on every navigation, query-string
changes included. Layouts are preserved across navigations and would be handed a
value that goes stale, so the framework withholds it.

The five tab pages could therefore read `?st=` today with a one-line props
change. The layout cannot, and the layout is what 404s. Passing `searchParams`
down as props is not a viable strategy.

### Options considered

| Option | Verdict |
|---|---|
| Thread `searchParams` from each `page.tsx` | **Rejected.** Never reaches the layout, which is what 404s. |
| Move the layout's fetching and shell into all 5 pages | **Viable, not chosen.** No middleware at all, but restructures rendering across 7 files and moves the header/sidebar across the layout/page boundary, so they remount on tab navigation. |
| Store the token in a cookie on first visit | **Rejected.** A credential outliving the URL is a worse posture, and it breaks login return URLs. |
| Parallel route slots (`@header/page.tsx` is a page, so it gets `searchParams`) | **Rejected.** Needs `default.tsx` for every nested tab route; the codebase uses the feature nowhere. |
| Read the token from a request header injected by `proxy.ts` | **Chosen.** One extraction point, readable from layouts, pages, and `generateMetadata` alike. Smallest diff; leaves rendering untouched. |

The tradeoff accepted: with the proxy, a matcher that stops matching means server
components silently see no token and share links 404 with nothing nearby to
explain why. §9.12 exists to catch that.

---

## 3. Phase 1 — Token plumbing

### 3.1 `lib/shareToken/constants.ts` (new)

```ts
/** Query parameter carrying the share token, mirroring the backend's SHARE_TOKEN_PARAM. */
export const SHARE_TOKEN_PARAM = 'st';

/** Request header the proxy forwards the token on, so layouts can read it. */
export const SHARE_TOKEN_HEADER = 'x-share-token';
```

### 3.2 `proxy.ts` (modify)

The current file gates four route groups behind a session:

```1:14:proxy.ts
import { withAuth } from 'next-auth/middleware';

// Gate protected routes on a valid session token.
// This is only an optimistic redirect — real authorization is enforced server-side
// (see services/client.ts).
export const proxy = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*', '/referral', '/lists', '/list/:path*'],
};
```

#### Do not wrap the share-token logic in `withAuth`

The obvious move is `withAuth(middlewareFn, { callbacks: { authorized } })` with
a path-gated callback. That is wrong here. From `next-auth/next/middleware.js`:

```js
const token = await getToken({ req, decode, cookieName, secret });
const isAuthorized = await options?.callbacks?.authorized?.({ req, token }) ?? !!token;
if (isAuthorized) return await onSuccess?.(token);
```

`getToken()` is awaited **unconditionally, before** the `authorized` callback
runs. Every anonymous proposal page view would pay a full JWE decrypt of the
session cookie and then hand the result to a callback that ignores it. A few
lines earlier, a missing `NEXTAUTH_SECRET` redirects to an auth error page —
wrapping would pull proposal pages into NextAuth's failure domain, where today
only `/notebook`, `/lists`, `/list`, and `/referral` live.

#### Branch before NextAuth runs instead

```ts
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { SHARE_TOKEN_HEADER, SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';

// Unchanged from the previous behavior of this file — only given a name so the
// share-token branch below can run ahead of it.
const requireAuth = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

// Lift `?st=` onto a request header. Layouts cannot read `searchParams`, and the
// proposal layout is what decides whether the page 404s, so the token has to
// reach it some other way.
function forwardShareToken(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const token = request.nextUrl.searchParams.get(SHARE_TOKEN_PARAM);

  // Set or clear unconditionally: the URL is the only source of truth, so a
  // client-supplied header can never survive. Spoofing this is not an
  // escalation — the backend validates the token — but determinism matters.
  if (token) {
    requestHeaders.set(SHARE_TOKEN_HEADER, token);
  } else {
    requestHeaders.delete(SHARE_TOKEN_HEADER);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // Proposal pages are public and must never be auth-gated; the proxy runs on
  // them only to forward the share token. Every other path in the matcher below
  // is auth-gated, so adding a public route there needs a branch here too.
  if (request.nextUrl.pathname.startsWith('/proposal/')) {
    return forwardShareToken(request);
  }
  return requireAuth(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    '/notebook/:path*',
    '/notebook/api/:path*',
    '/referral',
    '/lists',
    '/list/:path*',
    '/proposal/:path*',
  ],
};
```

Why this is safe rather than a new pattern: `withAuth(options)` is typed
`NextMiddlewareWithAuth`, i.e. `(request, event) => result`. Today's
`export const proxy = withAuth({...})` already *is* that function, and Next.js
has been invoking it with exactly `(request, event)` on every protected request.
Naming it and calling it ourselves is the same call through the same code path.
The `as NextRequestWithAuth` cast is types-only; `nextauth` is a property
`withAuth` populates internally and never reads from the incoming request.

Result: proposal requests do zero NextAuth work — no `getToken`, no crypto, no
secret dependency. Protected routes take a byte-for-byte identical path.

Two things to get right:

1. **It must be `NextResponse.next({ request: { headers } })`.** The
   `NextResponse.next({ headers })` form sends headers to the *client* and fails
   silently for our purposes.
2. **The branch and the matcher must stay in sync.** A public route added to the
   matcher without a corresponding branch gets auth-gated. Hence the comment and
   the regression check in §9.12.

### 3.3 `lib/shareToken/server.ts` (new)

```ts
import { headers } from 'next/headers';
import { SHARE_TOKEN_HEADER } from './constants';

/**
 * The share token for the current request, forwarded by `proxy.ts`.
 *
 * Server-only. Layouts cannot read `searchParams`, so the proxy lifts the token
 * out of the URL and onto a request header to give every server surface on the
 * proposal route — layout, pages, and generateMetadata — one way to reach it.
 */
export async function getShareToken(): Promise<string | null> {
  return (await headers()).get(SHARE_TOKEN_HEADER);
}
```

Calling `headers()` opts the route into dynamic rendering. This costs nothing
here: the proposal routes declare no `generateStaticParams`, `dynamic`, or
`revalidate`, and are already dynamic because `ApiClient` calls
`getServerSession` on every request.

### 3.4 `lib/shareToken/url.ts` (new)

```ts
/** Strip `st` from a URL before it is shared publicly or sent to analytics. */
export function stripShareToken(url: string): string { /* … */ }
```

Used in §6.3.

### 3.5 `hooks/useShareToken.ts` (new)

```ts
'use client';

import { useSearchParams } from 'next/navigation';
import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';

/** Client-side counterpart to `getShareToken()`, read straight from the URL. */
export function useShareToken(): string | null {
  return useSearchParams().get(SHARE_TOKEN_PARAM);
}
```

---

## 4. Phase 2 — Service layer

### 4.1 Reading: `PostService.get` and `MetadataService.get`

```53:71:services/post.service.ts
export class PostService {
  private static readonly BASE_PATH = '/api/researchhubpost';

  static async get(id: string): Promise<Work> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/${id}/`);
    return transformPost(response);
  }
```

becomes:

```ts
static async get(id: string, options?: { shareToken?: string | null }): Promise<Work> {
  const response = await ApiClient.get<any>(
    appendShareToken(`${this.BASE_PATH}/${id}/`, options?.shareToken)
  );
  return transformPost(response);
}
```

Same treatment for `MetadataService.get(unifiedDocumentId, options?)`. An
options object rather than a positional argument, matching `feed.service.ts`.

Add one helper to `services/lib/serviceUtils.ts`:

```ts
export function appendShareToken(path: string, shareToken?: string | null): string {
  if (!shareToken) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${SHARE_TOKEN_PARAM}=${encodeURIComponent(shareToken)}`;
}
```

**Not in `ApiClient`.** Attaching the token automatically would be less code but
would turn a document-scoped credential into an ambient one on every outbound
request, including absolute-URL requests that leave our origin. The backend
author made the same call deliberately — `shared_unified_document_id` is opt-in
per call site "so a share token can never widen discovery surfaces". Exactly two
service methods should know about the token.

### 4.2 `types/shareLink.ts` (new)

```ts
import { createTransformer } from './transformer';

export interface ShareLinkApiResponse {
  token: string;
  expires_at: string;
  created_date: string;
}

export interface ShareLink {
  token: string;
  expiresAt: Date;
  createdDate: Date;
}

export const transformShareLink = createTransformer<ShareLinkApiResponse, ShareLink>((raw) => ({
  token: raw.token,
  expiresAt: new Date(raw.expires_at),
  createdDate: new Date(raw.created_date),
}));
```

### 4.3 `services/shareLink.service.ts` (new)

```ts
export class ShareLinkService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';

  private static path(unifiedDocumentId: ID): string {
    return `${this.BASE_PATH}/${unifiedDocumentId}/share_link/`;
  }

  /**
   * Turns sharing on and returns the link.
   *
   * Regenerates an expired link and permanently retires the previous URL, so
   * this must only run on an explicit user action — never on render.
   *
   * @throws {ApiError} 403 when the caller is not an author, grant creator, or
   * moderator; 400 when the proposal has not cleared moderation.
   */
  static async enable(unifiedDocumentId: ID): Promise<ShareLink> {
    const response = await ApiClient.post<ShareLinkApiResponse>(this.path(unifiedDocumentId));
    return transformShareLink(response);
  }

  /**
   * Turns sharing off, invalidating any link already handed out.
   *
   * Idempotent — succeeds whether or not a link existed. Turning sharing back
   * on later mints a different token; the old URL never revives.
   *
   * @throws {ApiError} 403 when the caller is not eligible.
   */
  static async disable(unifiedDocumentId: ID): Promise<void> {
    await ApiClient.deleteNoContent(this.path(unifiedDocumentId));
  }
}
```

`deleteNoContent` is the right `ApiClient` method — DELETE returns `204` with no
body, and `ApiClient.delete` would fail trying to parse it.

Named `enable`/`disable` rather than `create`/`remove` because the UI is a
toggle and the backend models it as on/off state, not object lifecycle.

**Known limitation:** `ApiClient.post` discards the status code, so the service
cannot distinguish `201` (freshly minted) from `200` (existing link returned).
Irrelevant for a toggle; noted in case the copy ever needs it.

### 4.4 Blocked: reading current state

See §11.1. A `GET` on the same URL is needed for the toggle to render its
initial state, and does not exist yet.

---

## 5. Phase 3 — Route call sites

Seven files. Each reads the token once and threads it into the service calls it
already makes.

| File | Changes |
|---|---|
| `app/proposal/[id]/page.tsx` | `PostService.get` in the redirect path. `st` already survives the redirect itself via `createUrlSearchParams`. |
| `app/proposal/[id]/[slug]/layout.tsx` | `PostService.get` + `MetadataService.get` in the default export, **and** `PostService.get` in `generateMetadata`. |
| `.../[slug]/page.tsx` | `PostService.get` (via the local `getFundingProject`) + `MetadataService.get`, in the default export and `generateMetadata`. |
| `.../[slug]/conversation/page.tsx` | same |
| `.../[slug]/reviews/page.tsx` | same |
| `.../[slug]/updates/page.tsx` | same |
| `.../[slug]/bounties/page.tsx` | same |

`getFundingProject(id)` is defined locally and near-identically in each tab page
and gains a token parameter in each. Consolidating those duplicates is tempting
but out of scope — keep the diff reviewable.

`CommentService.fetchAuthorPosts` is left alone; it already swallows errors and
returns `[]`, and per §1 it is not access-gated anyway.

### 5.1 Suppress indexing on tokenized URLs

In `generateMetadata` for the layout and each tab page, when a token is present:

```ts
robots: { index: false, follow: false }
```

Without this a crawler reaching a shared link could index a private proposal,
turning a 30-day link into permanent exposure. The canonical URL is built from
`params` and already excludes `st`, so that side is safe as-is.

---

## 6. Phase 4 — Keeping the token in the URL

Three places drop or leak it. All three are bugs the feature cannot ship with.

### 6.1 Tab switching silently strips the token

```126:133:components/work/WorkTabs.tsx
      const newUrl = tabUrlMap[tab] || baseUrl;
      const reportId = new URLSearchParams(window.location.search).get('rr');

      window.history.replaceState(
        null,
        '',
        reportId ? `${newUrl}?rr=${encodeURIComponent(reportId)}` : newUrl
      );
```

Because this is `history.replaceState` and not a router navigation, nothing
breaks immediately — tab content switches client-side through `WorkTabContext`.
But the address bar loses `st`, so a refresh 404s and any login return URL
captured afterwards is useless.

Fix: build the preserved query with `URLSearchParams` carrying both `rr` and
`st` instead of hand-concatenating one param.

### 6.2 Sidebar and subtitle links drop the token

`ProposalSidebar` → `PeerReviewsSection` and `WorkHeaderSubtitle` both build
review links with `buildWorkUrl`, which produces real navigations:

```35:40:components/work/ProposalSidebar.tsx
          reviewsUrl={buildWorkUrl({
            id: work.id,
            contentType: work.contentType,
            slug: work.slug,
            tab: 'reviews',
          })}
```

Fix: add an optional `shareToken` to `buildWorkUrl`'s parameter object, appended
after the existing tab-suffix logic at `utils/url.ts:377`. Pass it only from the
proposal surfaces. `ProposalSidebar` is a server component and takes it as a
prop from the layout; `WorkHeaderSubtitle` is client-side and uses
`useShareToken()`.

### 6.3 The social Share button would broadcast the token

```150:156:components/work/WorkHeader/WorkHeader.tsx
  const shareAction = () =>
    showShareModal({
      url: globalThis.location.href,
      docTitle: work.title,
      action: 'USER_SHARED_DOCUMENT',
      shouldShowConfetti: false,
    });
```

and `WorkHeaderProposal.handleContributeSuccess` (line 58), same pattern. An
eligible admin viewing with `?st=` who clicks Share would post the private token
to Twitter. Fix: run both through `stripShareToken` (§3.4).

---

## 7. Phase 5 — Login return

A visitor who signs in from a shared page must land back on it with the token
intact.

| Flow | Today |
|---|---|
| Email login in the modal | Fine. `redirect: false`, session updates in place, no navigation. |
| **Google OAuth in the modal** | **Broken.** Lands on `/`. |
| `/auth/signin?callbackUrl=…` | Fine, if the caller encoded a full URL. |

`AuthModal` renders `AuthContent` without a `callbackUrl`:

```38:43:components/modals/Auth/AuthModal.tsx
        <AuthContent
          onClose={onClose}
          onSuccess={onSuccess}
          initialError={initialError}
          modalView={true}
        />
```

`SelectProvider` then falls back through `callbackUrl` prop → `?callbackUrl=` on
the current page → `'/'`, and navigates away.

`ContributeToFundraiseModal` already solves this:

```475:480:components/modals/ContributeToFundraiseModal.tsx
          <AuthContent
            ...
            callbackUrl={typeof window !== 'undefined' ? window.location.href : undefined}
          />
```

**Fix:** make that the default in `AuthModal` instead of a per-caller opt-in.
`window.location.href` includes the query string, so `st` survives the OAuth
round trip. This also fixes OAuth return for every other page in the app —
a real benefit, but it widens the blast radius, so call it out in the PR.

Access survives the login: `visible_to()` ORs the shared document in on the
authenticated branch too, so signing in as a non-eligible account keeps the view.

Out of scope: `/for-you` and `/following` hardcode pathname-only callback URLs,
and `app/verify/[key]` always returns to `/`. Neither is reachable from a share
link.

---

## 8. Phase 6 — Share link UI

### 8.1 Placement

The request was to add the item to the three-dot menu in
`components/work/WorkHeader/WorkHeader.tsx`. It should instead live in
**`components/work/WorkHeader/WorkHeaderProposal.tsx`**, which renders into that
same menu through `WorkHeader`'s existing `additionalMenuItems` prop. Same UI
outcome, better placement:

- `WorkHeader` is shared by papers, posts, questions, grants, and proposals. A
  proposal-only item there needs a content-type guard `WorkHeaderProposal` gets
  for free.
- Direct precedent one function up — `makePublicMenuItem` is a proposal-only
  item defined there and passed through `additionalMenuItems`, with its
  `ConfirmationModal` rendered as a sibling:

```81:86:components/work/WorkHeader/WorkHeaderProposal.tsx
  const makePublicMenuItem = canMakePublic ? (
    <BaseMenuItem onSelect={() => setIsMakePublicModalOpen(true)}>
      <Globe2 className="h-4 w-4 mr-2" />
      Make public
    </BaseMenuItem>
  ) : undefined;
```

- It touches zero shared files: `useWorkHeaderMenu.tsx`, `WorkHeaderModals.tsx`,
  and `WorkHeader.tsx` are all left alone.

`additionalMenuItems` is typed `ReactNode`, so passing a fragment with both items
needs no signature change.

### 8.2 Gate

`WorkHeaderProposal` already computes the needed identity at lines 48–53:

```ts
const isOwner = user?.id != null && displayedWork.createdByUserId === user.id;
```

The share-link gate reuses that shape and adds the moderation condition the
backend now enforces:

```ts
const canShareLink =
  displayedWork.contentType === 'preregistration' &&
  displayedWork.moderationStatus !== 'PENDING' &&
  (isOwner || !!user?.isModerator || !!user?.authorProfile?.isHubEditor);
```

The moderation clause is not cosmetic: `_assert_can_share` rejects a
non-approved proposal with `400`, so without it the toggle would present an
action guaranteed to fail. See §11.2 and §11.3 for the two decisions this
encodes.

### 8.3 `components/modals/ShareLinkModal.tsx` (new)

Props: `{ isOpen, onClose, unifiedDocumentId, proposalUrl }`.

Layout, top to bottom:

1. A `Toggle` labelled something like **"Anyone with the link can view"**, with
   supporting copy explaining that the link grants view access to a private
   proposal.
2. When on: the assembled URL `{origin}{proposalUrl}?st={token}` in a read-only
   input with a Copy button, plus the expiry date.
3. When off: the URL area is replaced by a short explanation, not a disabled
   input, so there is no stale URL on screen to copy by accident.

Behavior:

- **On mount / open:** read current state. Blocked on §11.1 — there is no `GET`.
  It must *not* be a `POST`, because opening a modal to inspect state would mint
  a link for a proposal that never had one, and would rotate an expired one.
- **Toggle off → on:** `ShareLinkService.enable`, then reveal the URL. Optimistic
  toggle with rollback on failure.
- **Toggle on → off:** `ShareLinkService.disable`, then hide the URL. This is
  destructive and irreversible — turning sharing back on mints a *different*
  token — so it needs a confirmation step or, at minimum, copy that says the
  existing link stops working immediately. Prefer a confirm; silent revocation
  of a URL already emailed to a reviewer is a bad surprise.
- **Copy:** `navigator.clipboard.writeText` in try/catch with a toast, per
  `components/modals/MFA/EnableMfaModal.tsx:95-112`. The read-only-input-plus-
  Copy-button markup follows `components/modals/ShareModal.tsx:144-258`.
- **Errors:** surface `extractApiErrorMessage(error, …)`; the backend's 403 and
  400 messages are already user-readable.

`BaseModal` usage: `size="md"`, a string `title`, and a `footer`. Both `title`
and `footer` must be set or `BaseModal` switches into fullscreen mode
(`components/ui/BaseModal.tsx:76`).

State (`isShareLinkModalOpen`) lives in `WorkHeaderProposal` beside
`isMakePublicModalOpen`; the modal renders as a sibling of the existing
`ConfirmationModal`.

---

## 9. Phase 7 — Verification

Manual, against a private, approved proposal on a local backend running the PR
branch.

**Setup.** Create a proposal, set `unified_document.is_public = False`, mint a
token via the `curl` in the PR description.

1. **Anonymous, valid token** — `/proposal/{id}/{slug}?st=TOKEN` in a private
   window renders fully: header, sidebar, content, tabs.
2. **Anonymous, no token** — same URL without `?st=` still 404s.
3. **Anonymous, token from a different proposal** — 404s.
4. **Expired token** — reads identically to no token.
5. **Tab navigation** — click each tab; `st` stays in the address bar; refresh on
   each tab still renders.
6. **Sidebar review link** — navigates without losing access.
7. **Google login from the shared page** — returns to the proposal URL with `st`
   intact and the page still renders.
8. **Email login from the shared page** — stays in place, no navigation.
9. **Social share button while `?st=` is in the URL** — the copied/shared URL has
   no token in it.
10. **Toggle on** — three-dot → Share link → toggle on shows a URL and expiry.
    Reopening the modal shows the toggle already on and the same URL.
11. **Toggle off** — the anonymous window on that URL now 404s. Toggling on again
    yields a *different* token, and the old URL stays dead.
12. **Regression: protected routes** — `/notebook`, `/lists`, `/list/x`,
    `/referral` still redirect to sign-in when logged out. This is the
    `proxy.ts` change's blast radius and the single most important check here.
13. **Regression: normal proposal pages** — logged in and logged out, no token,
    unchanged.
14. **Ineligible user** — does not see the menu item; a direct `POST`/`DELETE`
    returns 403.
15. **Pending-moderation proposal** — the menu item is absent.
16. **Page source on a tokenized URL** — contains
    `<meta name="robots" content="noindex">` and no `st` in the canonical or OG
    URLs.

While testing, check whether `AnalyticsService` captures `window.location.href`
anywhere on this page. If it does, the token ships to Amplitude and needs the
same `stripShareToken` treatment as §6.3.

---

## 10. Implementation order

Each step should build and be independently reviewable.

1. **Plumbing** — `constants.ts`, `server.ts`, `url.ts`, `useShareToken.ts`,
   `proxy.ts`. Verify §9.12 before going further.
2. **Services (read)** — `appendShareToken`, `PostService.get`,
   `MetadataService.get`. No behavior change; all callers still pass nothing.
3. **Route call sites** — the seven files, plus `robots`. Read access works
   end-to-end after this; verify §9.1–9.4.
4. **URL preservation** — `WorkTabs`, `buildWorkUrl`, share-URL scrubbing.
   Verify §9.5, 9.6, 9.9.
5. **Login return** — `AuthModal`. Verify §9.7, 9.8.
6. **Toggle UI** — types, `ShareLinkService`, modal, menu item. Verify
   §9.10, 9.11, 9.14, 9.15. Gated on §11.1.

Steps 1–3 are the spine; 4–6 are independently shippable on top. Step 6 is the
only one blocked on a backend addition, so it should not hold up the rest.

---

## 11. Open items

### 11.1 Blocker: the toggle needs a `GET` (backend addition)

There is no way to read whether sharing is currently on. `POST` is not a
substitute — it mints a link for a proposal that never had one and rotates an
expired token, and the view docstring explicitly forbids calling it on render.

**Ask:** add `@share_link.mapping.get` alongside the existing `.delete` mapping,
guarded by `_assert_can_manage` (not `_assert_can_share`, so state is still
readable for a declined proposal). Return `200` with the same serializer when a
live link exists, `404` when none does. That completes a clean GET/POST/DELETE
trio on one URL and is a handful of lines given `disable_share_link` already
exists.

It also resolves the edge case in §11.2: a proposal shared while private and
later made public could otherwise strand an active link with no UI to turn it
off.

**Fallbacks if the endpoint isn't added:** default the toggle to off and accept
that it misreports state until touched — poor, since flipping it on for an
already-shared proposal is harmless but flipping it off then on silently rotates
a live token. Or expose a `has_share_link` boolean on the post payload for
eligible users, which is more coupling for less clarity. Neither is good; the
`GET` is worth the small backend change.

### 11.2 Whether to gate the menu item on visibility

Resolved differently than in the first draft. That draft argued against gating
on `work.isPublic === false`, because a public-but-`PENDING` proposal is also
unreachable anonymously. The backend has since closed that door: minting
requires `is_approved`, and `resolve_unified_document_id` filters on
`status=APPROVED`. Approval is no longer an axis a share link can cross, so the
only remaining one is public vs. private.

**Recommendation:** show the item only when `work.isPublic === false`. A public
proposal's URL already works for everyone, so the toggle would be noise. Once
§11.1 lands, widen it to "private **or** a link already exists" so a proposal
made public after sharing can still be un-shared.

### 11.3 Grant creators will not see the menu item

The backend treats the creator of a grant the proposal applied to as eligible,
but `work.linkedGrant` carries only `{ id, postId, title, shortTitle,
applicationVisibility }` — no creator identity — so the frontend cannot detect
that persona. The gate in §8.2 covers moderators, hub editors, and owners only.

**Recommendation:** ship without it and add the grant's creator to the
linked-grant payload in a follow-up. The alternative — showing the item to
everyone and letting the 403 surface as a toast — puts a dead control in front
of most viewers.

### 11.4 Which URL the copied link points at

Whether the link targets the proposal's main tab or the tab the admin is
currently viewing.

**Recommendation:** always the main tab.
