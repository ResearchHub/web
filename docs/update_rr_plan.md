# Registered Report Tracker Route Plan

## Summary
Replace the current in-page registered-report stage swapping with normal work-page navigation. The tracker will render on grant, proposal, and report pages only when a valid `?rr=...` param exists. Tracker step clicks will open the normal target page in a new tab with the same `rr` context attached.

## Key Changes
- Add a shared `rr` utility:
  - Payload shape: `{ v: 1, r: registered_report_id, g?: grant_id, f?: fundraise_id }`.
  - Encode as JSON -> tiny reversible obfuscation -> base64url -> lightweight checksum.
  - Decode returns `null` for malformed, wrong checksum, wrong version, or non-numeric IDs.
- Add server-side validation:
  - No `rr`: keep normal page behavior.
  - Valid-looking `rr`: fetch `PostService.getRegisteredReportWork(r)`.
  - Validate the current route stage against tracker data and validate grant/fundraise hints when present.
  - Any invalid or mismatched `rr` calls `notFound()`.
- Replace the old tracker behavior:
  - Remove the client-side fetch-and-swap stage flow.
  - Remove the registered-report context/shell/body/header-tab machinery that only existed for the current setup.
  - Remove dead service/type helpers used only by that old stage-swapping flow.
  - Keep/reuse only the pieces needed for tracker display, route URL building, and registered-report content rendering.
- Add the new route-based tracker:
  - Reuse the current pizza tracker styling/icons.
  - Render below the page header on supported work routes.
  - Existing steps open normal work pages in a separate tab with `?rr=...`.
  - Missing steps remain disabled.
- Update affected routes:
  - Add `searchParams` validation and tracker rendering to grant, proposal, and report base pages.
  - Add validation to proposal tab subroutes so invalid `rr` cannot bypass 404 behavior.
  - Preserve `rr` when WorkTabs changes tab URLs.
  - Preserve `rr` through slugless redirects like `/proposal/[id] -> /proposal/[id]/[slug]`.

## Public Interfaces
- New type: `RegisteredReportRoutePayload`.
- New helpers:
  - `encodeRegisteredReportRoutePayload(payload)`
  - `decodeRegisteredReportRoutePayload(rr)`
  - `getRegisteredReportRouteContext({ rr, currentStage, work, metadata })`
  - `buildRegisteredReportTrackerHref(step, rr)`
- No backend API change planned; use the existing `registered_report_work` endpoint as the source of truth.

## Test Plan
- Run `npm run type-check`.
- Manual validation:
  - No `rr`: pages behave normally.
  - Valid `rr`: tracker appears and current stage is highlighted.
  - Clicking another existing stage opens the normal page in a separate tab with `?rr=...`.
  - Missing tracker stages are disabled.
  - Malformed, decoded-invalid, or mismatched `rr` renders 404.
  - Proposal tab navigation preserves `rr`.
  - Old `/report` behavior no longer performs in-page stage swapping.

## Assumptions
- `registered_report_id` means the registered-report post ID accepted by `PostService.getRegisteredReportWork`.
- The `rr` encoding is lightweight obfuscation, not security. Server-side tracker validation is the actual correctness check.
- Tracker placement just below the header is acceptable for v1 because it allows page-level `searchParams` validation.
