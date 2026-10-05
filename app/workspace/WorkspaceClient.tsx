'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PageLayout } from '@/app/layouts/PageLayout';

/** The app's shell with the workspace's areas empty, until the workspace itself has loaded. */
function WorkspaceShell() {
  return (
    <PageLayout fullBleed leftSidebarContent={null}>
      <div className="min-h-0 flex-1 bg-gray-50" />
    </PageLayout>
  );
}

// Client-only: the workspace sizes its panes from the window and from widths
// remembered in the browser, none of which a server render can know.
const WorkspacePage = dynamic(
  () => import('@/components/AIMode/WorkspacePage').then((module) => module.WorkspacePage),
  { ssr: false, loading: () => <WorkspaceShell /> }
);

/** Behind Suspense because the workspace reads what it is open on from the URL's search params. */
export function WorkspaceClient() {
  return (
    <Suspense fallback={<WorkspaceShell />}>
      <WorkspacePage />
    </Suspense>
  );
}
