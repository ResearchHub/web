# Glossary

Domain and architecture vocabulary for the ResearchHub web app. Terms are grouped by area, and
every entry points at the file that defines it so you can confirm the current shape before relying
on it.

Read this alongside [`AGENTS.md`](../AGENTS.md) and the architecture rules in `.cursor/rules/`.

## Naming conventions

| Convention               | Meaning                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `transformX`             | Converts a snake_case Django payload into a camelCase client model. Defined next to the type it produces, in `types/`. |
| `createTransformer`      | Wrapper in `types/transformer.ts` that attaches the untouched API payload as `.raw` on the result.                     |
| `BaseTransformed<T>`     | Interface declaring `raw: T`. `TransformedWork`, `TransformedUser`, etc. are `Domain & BaseTransformed`.               |
| `Raw*`, `*ApiResponse`   | Wire shapes before transformation, e.g. `RawApiFeedEntry`, `FeedApiResponse` in `types/feed.ts`.                       |
| `*Service`               | Class of `static` methods wrapping one Django domain, in `services/`.                                                  |
| `use*`                   | React hook in `hooks/`, one hook per file.                                                                             |
| `*Context` / `*Provider` | React context module in `contexts/`, mounted from `components/providers/ClientProviders.tsx`.                          |

## Core primitives

| Term       | Definition                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ID`       | `string \| number \| null \| undefined`. Deliberately loose because Django ids arrive as both strings and numbers. `types/root.ts`. |
| `Currency` | `'RSC' \| 'USD'`. `types/root.ts`.                                                                                                  |
| `slug`     | URL-safe title segment. Canonical content URLs are `/{segment}/{id}/{slug}`; build them with `buildWorkUrl` in `utils/url.ts`.      |
| `raw`      | The original API response preserved on transformed objects. Useful when a field has no camelCase mapping yet.                       |

## Content model

| Term                      | Definition                                                                                                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Work**                  | The client-side model for any research document — paper, post, proposal, question, or funding request. Carries authors, topics, formats, metrics, and optional fundraise, tips, and peer reviews. `types/work.ts`.                                             |
| **Unified document**      | Django's cross-content parent row that ties a paper/post to its comments, bounties, votes, and feed entries. Exposed as `Work.unifiedDocumentId` and as `UnifiedDocument` in `types/root.ts`. Many endpoints key off this id rather than the paper or post id. |
| `ContentType`             | Client content classification: `'post' \| 'paper' \| 'preregistration' \| 'question' \| 'discussion' \| 'funding_request'`. `types/work.ts`.                                                                                                                   |
| `WorkType`                | Publication form of a work: `'article' \| 'review' \| 'preprint' \| 'preregistration' \| 'funding_request'`. `types/work.ts`.                                                                                                                                  |
| `ApiDocumentType`         | Django's document type enum: `'DISCUSSION' \| 'ELN' \| 'GRANT' \| 'NOTE' \| 'PAPER' \| 'QUESTION' \| 'PREREGISTRATION'`. Map with `mapApiDocumentTypeToClientType` in `utils/contentTypeMapping.ts`.                                                           |
| `DocumentType`            | In `services/reaction.service.ts` this is the API path segment, only `'paper' \| 'researchhubpost'`. `mapAppContentTypeToApiType` produces it. A different `DocumentType` in `types/user.ts` is the moderation enum — check your import.                       |
| `DocumentVersion`         | A paper's version history entry, with `isLatest`, `isVersionOfRecord`, `isResearchHubJournal`, and `publicationStatus`. `types/work.ts`.                                                                                                                       |
| `ModerationStatus`        | `'PENDING' \| 'APPROVED' \| 'DECLINED'` on a work. `types/work.ts`.                                                                                                                                                                                            |
| `FlagReasonKey`           | Content flag reasons: `LOW_QUALITY`, `COPYRIGHT`, `NOT_CONSTRUCTIVE`, `PLAGIARISM`, `ABUSIVE_OR_RUDE`, `SPAM`. Labels in `constants/flags.ts`.                                                                                                                 |
| **Route segment mapping** | `paper → paper`, `post → post`, `question → question`, `proposal → preregistration`, `fund → preregistration`, `grant → funding_request`. `ROUTE_SEGMENT_TO_CONTENT_TYPE` in `utils/url.ts`.                                                                   |
| **Work pages**            | The document detail routes `app/{paper,post,proposal,question,report}/[id]/[slug]/**/page.tsx`. They are the only files covered by the `researchhub/work-document-tracking` lint rule.                                                                         |

## Topics, hubs, journal

| Term                          | Definition                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Topic**                     | The canonical subject-area model: `name`, `slug`, `namespace`, and counts. `namespace` is `'journal' \| 'topic' \| 'category' \| 'subcategory'`. `types/topic.ts`.                                                              |
| **Hub**                       | The backend's name for a topic, and a legacy client type kept only for older call sites — `types/hub.ts` is marked for removal in favor of `Topic`. API payloads say `hubs`/`hub_image`; client models say `topics`/`imageUrl`. |
| **RHJ / ResearchHub Journal** | ResearchHub's own journal, at `/journal`. There is no `Journal` subtype for it; a version is identified by `DocumentVersion.isResearchHubJournal`.                                                                              |
| `Journal`                     | Publication venue, with `status?: 'published' \| 'preprint'`. `types/journal.ts`.                                                                                                                                               |

## Funding: grants, proposals, fundraises

The funding flow reads: a funder posts an **RFP** (a `Grant`), researchers submit **proposals**
(`preregistration` posts), each proposal runs a **fundraise**, and a funded proposal can publish a
**registered report**.

| Term                            | Definition                                                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RFP / Request for Proposal**  | A funder's open call for work. Modelled as `Grant` (`types/grant.ts`), served at `/grant/[id]/[slug]`, listed at `/fund`, and carried on a work as `contentType: 'funding_request'`. A notebook draft of one is detected by `isRfpNote` in `types/note.ts`. |
| **Proposal / Preregistration**  | A research plan submitted in answer to an RFP. `contentType: 'preregistration'`, URL `/proposal/[id]/[slug]`, API document type `PREREGISTRATION`. "Preregistration" is the data model's word; "proposal" is the UI's.                                      |
| `GrantStatus`                   | `'OPEN' \| 'CLOSED' \| 'PENDING' \| 'DECLINED' \| 'COMPLETED'`. Badge config in `GRANT_STATUS_CONFIG`. `types/grant.ts`.                                                                                                                                    |
| `GrantApplicationVisibility`    | `'OPTIONAL' \| 'PRIVATE' \| 'PUBLIC'` — whether applications to an RFP are publicly listed. `types/grant.ts`.                                                                                                                                               |
| **Fundraise**                   | The crowdfunding campaign on a proposal. Holds `goalAmount` and `amountRaised` as `{ usd, rsc }` pairs plus contributors. `types/funding.ts`.                                                                                                               |
| `FundraiseStatus`               | `'OPEN' \| 'COMPLETED' \| 'CLOSED'`. `types/funding.ts`.                                                                                                                                                                                                    |
| `computeGoalRate`               | For a `COMPLETED` fundraise, derives a fixed RSC→USD rate from `goalUsd / raisedRsc` so the displayed total matches the goal instead of drifting with the live rate. `types/funding.ts`.                                                                    |
| `rscUsdSnapshot`                | USD value of an RSC amount at the time of the transaction. Prefer it over the live exchange rate for historical totals. `types/funding.ts`, `types/funder.ts`.                                                                                              |
| **Application**                 | A researcher's submission to an RFP, with contributors, fundraise, reviews, and AI key insight. `types/funding.ts`.                                                                                                                                         |
| **Registered report**           | A proposal's published outcome, at `/report/[id]/[slug]`. `RegisteredReportStage` is `'grant' \| 'proposal' \| 'registered_report'`, labelled "Request for Proposal" / "Proposal" / "Registered Report" in the tracker. `types/registeredReport.ts`.        |
| **Funding credits**             | Locked RSC that can be spent on funding but not withdrawn, granted through the referral program. `UserBalances.rscFundingCredits`, `types/referral.ts`.                                                                                                     |
| **Nonprofit / DAF / Endaoment** | A fundraise can route funds to a nonprofit through Endaoment, a Donor Advised Fund provider. `types/nonprofit.ts`, `types/endaoment.ts`. External nonprofit ids are prefixed `endaoment-`.                                                                  |

## ResearchCoin

| Term                    | Definition                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RSC / ResearchCoin**  | ResearchHub's ERC-20 reward token: 18 decimals, deployed on Base. `constants/tokens.ts`; `CHAIN_IDS.BASE = 8453` in `constants/chains.ts`.                                                                 |
| `UserBalances`          | `rsc` (spendable), `rscLocked` (= `rscPromotional` + `rscFundingCredits`), `totalRsc` (= `rsc` + `rscLocked`), and `totalUsdCents`. `rscPromotional` earns yield and is not withdrawable. `types/user.ts`. |
| **Exchange rate**       | Live RSC→USD rate, fetched once by `ExchangeRateProvider` and read via `useExchangeRate()`. `contexts/ExchangeRateContext.tsx`.                                                                            |
| **Currency preference** | Per-user choice to display amounts in USD or RSC. `useCurrencyPreference()`, `contexts/CurrencyPreferenceContext.tsx`.                                                                                     |

## Engagement: bounties, tips, comments, reviews

| Term                    | Definition                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bounty**              | An RSC reward offered for work on a document, usually a peer review or an answer. `status` is `'OPEN' \| 'CLOSED' \| 'ASSESSMENT'`; `BountyType` is `'REVIEW' \| 'ANSWER' \| 'BOUNTY' \| 'GENERIC_COMMENT'`. `types/bounty.ts`.                 |
| **Bounty contribution** | Extra RSC pledged onto someone else's bounty. The API returns these as child bounties with a `parent`; `groupBountiesWithContributions` splits parents from contributions. `ContributionStatus` is `'ACTIVE' \| 'REFUNDED'`. `types/bounty.ts`. |
| **Bounty solution**     | A submission answering a bounty. `SolutionStatus` is `'AWARDED' \| 'PENDING'`. `types/bounty.ts`.                                                                                                                                               |
| **Tip**                 | RSC sent directly to a user for a piece of content. The API calls these `purchases`; `transformWork` maps `raw.purchases` onto `Work.tips`. `types/tip.ts`.                                                                                     |
| `Comment`               | A threaded comment. Also the storage model for reviews, answers, and bounty posts — the `commentType` discriminates. `types/comment.ts`.                                                                                                        |
| `CommentType`           | `'GENERIC_COMMENT' \| 'REVIEW' \| 'BOUNTY' \| 'ANSWER' \| 'AUTHOR_UPDATE'`. The moderation `CommentType` in `types/user.ts` is a wider, separate union that includes `PEER_REVIEW`.                                                             |
| `ContentFormat`         | `'QUILL_EDITOR' \| 'TIPTAP'`. Old comments are Quill; new content is TipTap. Both must render. `types/comment.ts`.                                                                                                                              |
| `Thread`                | Anchors a comment set to a document via `threadType`, `objectId`, and `privacyType` (`'PUBLIC' \| 'PRIVATE'`). `types/comment.ts`.                                                                                                              |
| **Peer review**         | A scored review of a work, stored as a `REVIEW` comment and surfaced as `PeerReview` on `Work`. `isAssessed` marks reviews that have been graded. Earn page is `/peer-review`.                                                                  |
| **AI peer review**      | Machine-generated review of a proposal, with `ReviewStatus` (`pending`/`processing`/`completed`/`failed`), `OverallRating`, and a `KeyInsightData` TLDR of strengths and weaknesses. `types/aiPeerReview.ts`.                                   |
| `VoteType`              | Numeric enum matching the API: `NEUTRALVOTE = 0`, `UPVOTE = 1`, `DOWNVOTE = 2`. `UserVoteType` is the string form. `VotableContentType` is `'comment' \| 'paper' \| 'researchhubpost'`. `types/reaction.ts`.                                    |

## People and organizations

| Term              | Definition                                                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`            | An authenticated account: email, verification, moderator/funder flags, balances, and an optional nested `authorProfile`. `types/user.ts`.                                                                                                      |
| `AuthorProfile`   | The public researcher identity — name, headline, ORCID, h-index, achievements. Exists for authors who have never signed up, so it is _not_ interchangeable with `User`. `isClaimed` is true when a `User` is linked. `types/authorProfile.ts`. |
| `AchievementType` | `'CITED_AUTHOR' \| 'OPEN_ACCESS' \| 'OPEN_SCIENCE_SUPPORTER' \| 'EXPERT_PEER_REVIEWER'`. `types/authorProfile.ts`.                                                                                                                             |
| **Organization**  | A notebook workspace that owns notes. `OrganizationRole` is `'ADMIN' \| 'EDITOR' \| 'VIEWER'`. Its `slug` is the `[orgSlug]` route param. `types/organization.ts`.                                                                             |
| **Editor**        | A paid hub editor. `EditorType` is `'ASSISTANT_EDITOR' \| 'ASSOCIATE_EDITOR' \| 'SENIOR_EDITOR'`; compensation runs through `AutoPayment`. `types/editor.ts`, `types/autoPayment.ts`.                                                          |
| **Moderator**     | Staff role gating `/moderators/*`. Sees extra fields such as `FeedEntry.riskScore` and `UserDetailsForModerator`.                                                                                                                              |

## Notebook

| Term                   | Definition                                                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Notebook**           | The collaborative editor at `/notebook/[orgSlug]/[noteId]`, where drafts are written before being published as posts, RFPs, or proposals. `components/Notebook/`.                                          |
| `Note`                 | A notebook document. `NoteAccess` is `'WORKSPACE' \| 'PRIVATE' \| 'SHARED'`. A published note links to its `post`. `types/note.ts`.                                                                        |
| `contentJson`          | The note body as serialized TipTap JSON. `plainText` is the extracted text. `NoteWithContent` in `types/note.ts`.                                                                                          |
| `NoteVersionSource`    | Who created a note version: `'editor' \| 'agent' \| 'system'`. `types/note.ts`.                                                                                                                            |
| `NOTE_VERSION_CREATED` | WebSocket event (`'note_version_created'`) broadcast when any writer commits a version. Carries ids only, no content. `types/note.ts`.                                                                     |
| **Note classifiers**   | `isRfpNote`, `isRegisteredReportNote`, `isPublishedRegisteredReportNote`, `isChangelogNote` — the supported way to tell what a draft is, since a note records its kind in several places. `types/note.ts`. |
| **Agent chat**         | The in-notebook AI assistant that drafts content into the editor. `types/notebookChat.ts` keeps its wire shapes snake_case with no transformer; models come from `types/notebookModels.ts`.                |

## Feed

| Term              | Definition                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FeedEntry`       | One row in any feed: timestamp, action, typed `content`, metrics, and optional `relatedWork`, tips, hot score, and moderation risk score. `types/feed.ts`.                                   |
| `FeedContentType` | What a feed row is about: `PAPER`, `POST`, `PREREGISTRATION`, `BOUNTY`, `COMMENT`, `APPLICATION`, `GRANT`, `USDFUNDRAISECONTRIBUTION`, `PURCHASE`, `FUNDINGACTIVITY`. `types/feed.ts`.       |
| `FeedActionType`  | `'contribute' \| 'open' \| 'publish' \| 'post'`. `types/feed.ts`.                                                                                                                            |
| `ActivityAction`  | The finer-grained action shown on the activity feed, e.g. `tip_review`, `bounty_payout`, `fundraise_contribution`, `proposal_submitted`. Derived by `deriveActivityAction`. `types/feed.ts`. |
| **Hot score**     | Server-side feed ranking, exposed as `hotScoreV2` with an optional `hotScoreBreakdown` for debugging. `types/feed.ts`.                                                                       |
| `FeedSource`      | Analytics label for which surface a feed impression came from: `home`, `earn`, `peer-review`, `fund`, `journal`, `topic`, `author`, `search`, `list`, `unknown`. `types/analytics.ts`.       |

## Data layer

| Term                  | Definition                                                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ApiClient`           | The single HTTP client, a static class in `services/client.ts`. Methods: `get`, `getPublic`, `getBlob`, `getStream`, `post`, `patch`, `delete`, `deleteNoContent`. Prefixes paths with `NEXT_PUBLIC_API_URL`.                                                                                        |
| **Django token auth** | The backend returns an opaque token (not a JWT) on login. It is stored on the NextAuth session as `authToken` and sent as `Authorization: Token <token>`. `services/client.ts`, `app/api/auth/[...nextauth]/auth.config.ts`.                                                                         |
| `ApiError`            | Thrown by `ApiClient` on non-OK responses, with `status` and DRF field `errors`. Turn one into a user-facing string with `extractApiErrorMessage` in `services/lib/serviceUtils.ts`. `services/types/api.ts`.                                                                                        |
| **DRF pagination**    | List endpoints return `{ count, next, previous, results }`. `next` is an absolute URL and can be passed straight back to `ApiClient.get`; callers usually derive `hasMore` from it. Requests page with `page` and `page_size`.                                                                       |
| `proxy.ts`            | The Next.js request proxy at the repo root, exporting `proxy()` plus a route `matcher` (there is no middleware file). Auth-gates `/notebook`, `/referral`, `/lists`, and `/list/*` — optimistically only, since real authorization happens server-side — and forwards share tokens on `/proposal/*`. |
| `ProxyService`        | Unrelated to `proxy.ts`: rewrites non-ResearchHub PDF URLs through `proxy.{env}.researchhub.com`, producing `FormatType.internalUrl` so the app can fetch and render them. `services/proxy.service.ts`.                                                                                              |
| **Share token**       | Grants access to a private proposal. Arrives as `?st=<token>` (`SHARE_TOKEN_PARAM`), is forwarded by `proxy.ts` as the `x-share-token` header (`SHARE_TOKEN_HEADER`), and is read server-side by `getShareToken()`. `lib/shareToken/`.                                                               |
| `WS_ROUTES`           | WebSocket URL builders for notebook, notifications, notebook chat, and note versions. Base is `NEXT_PUBLIC_WS_URL`, falling back to the API origin with the scheme swapped. `services/websocket.ts`.                                                                                                 |

## UI and state

| Term                       | Definition                                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cn()`                     | `twMerge(clsx(...))`. The only sanctioned way to compose Tailwind classes. `utils/styles.ts`.                                                                                                                                               |
| **Design system**          | Primitives in `components/ui/` (`Button`, `Badge`, `BaseModal`, `Tabs`, form controls under `components/ui/form/`). Multi-variant components use `cva`. Distinct from `components/Editor/components/ui/`, which is editor-only chrome.      |
| **Design tokens**          | Custom Tailwind colors `primary`, `gray`, `rhBlue`, and `orcid`, plus layout-specific breakpoints such as `mobile`, `tablet`, `content-md`, and `topbar-hide`. `tailwind.config.ts`, `app/styles/colors.ts`.                                |
| `CurrencyBadge`            | The RSC/USD amount badge. Note the mismatch: it lives in `components/ui/RSCBadge.tsx` but is exported as `CurrencyBadge`.                                                                                                                   |
| **State model**            | There is no Redux, Zustand, or Jotai. State lives in local hooks, then custom hooks in `hooks/`, then React contexts in `contexts/`, then URL params. `store/` holds static and mock data only, not global state.                           |
| `useUser()`                | The authenticated user, from `contexts/UserContext.tsx`.                                                                                                                                                                                    |
| `useAuthenticatedAction()` | Wraps an action so it opens the auth modal for signed-out users. `contexts/AuthModalContext.tsx`.                                                                                                                                           |
| `NavigationContext`        | Restores feed scroll position and cached entries across navigation. `contexts/NavigationContext.tsx`.                                                                                                                                       |
| **Editors**                | Two TipTap stacks: `BlockEditor` (`components/Editor/`, extensions registered in `components/Editor/extensions/extension-kit.ts`) for notes and documents, and `CommentEditor` (`components/Comment/`) for comments, reviews, and bounties. |
| `WorkDocumentTracker`      | Analytics component that every work page must render with `work`, `metadata`, and `tab` props. Enforced by the `researchhub/work-document-tracking` ESLint rule. `components/WorkDocumentTracker`.                                          |
| `LogEvent`                 | Analytics event-name constants passed to `AnalyticsService.logEvent`. `services/analytics.service.ts`.                                                                                                                                      |

## Ambiguous names

Several identifiers are reused with different meanings. Check the import path before assuming a shape.

| Name                       | Collision                                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ContentType`              | Client work types in `types/work.ts`; an API content-type object in `types/contribution.ts`; a parsed name union in `types/contributionTransformer.ts`.          |
| `DocumentType`             | API path segment (`'paper' \| 'researchhubpost'`) in `services/reaction.service.ts`; moderation enum in `types/user.ts`.                                         |
| `CommentType`              | Five-value comment union in `types/comment.ts`; wider moderation union in `types/user.ts`.                                                                       |
| `transformUnifiedDocument` | Returns `UnifiedDocument \| null` in `types/root.ts`; returns a `Work` in `types/work.ts`.                                                                       |
| `Contribution`             | A fundraise contribution event in `types/funding.ts`; an API list item in `types/contribution.ts`; a parsed activity item in `types/contributionTransformer.ts`. |
| `Author`                   | A lightweight `{ authorId, userId, name }` in `types/note.ts`, unrelated to `AuthorProfile`.                                                                     |
| `useComments`              | A standalone fetch hook in `hooks/useComments.ts`; the thread provider hook in `contexts/CommentContext.tsx`.                                                    |
