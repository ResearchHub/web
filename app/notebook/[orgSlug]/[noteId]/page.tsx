'use client';

// This page intentionally renders nothing. The actual note editor is
// rendered by `app/notebook/[orgSlug]/layout.tsx`, which mounts the
// editor based on the URL. This file exists so that the route resolves
// when a user navigates to /notebook/<org>/<noteId>.
//
// The funding-timeline modal used to render here when the org page
// auto-created a proposal and forwarded `?newFunding=true` to the new
// note's URL. That flow now lives on the org page itself
// (`app/notebook/[orgSlug]/page.tsx`) where the modal can drive the
// note creation, rather than appearing after the note already exists.
export default function NotePage() {
  return null;
}
