'use client';

import dynamic from 'next/dynamic';
import { PageLayout } from '@/app/layouts/PageLayout';
import { AIModeProvider } from '@/components/AIMode/AIModeContext';

/** The workspace's area, empty, until the workspace itself has loaded. */
function EmptyWorkspace() {
  return <div className="min-h-0 flex-1 bg-gray-50" />;
}

// Client-only: the workspace sizes its panes from the window and from widths
// remembered in the browser, none of which a server render can know. Only
// the area beside the sidebar waits for it: the app's shell around it is
// rendered once, and stays as the workspace arrives in it.
const WorkspacePage = dynamic(
  () => import('@/components/AIMode/WorkspacePage').then((module) => module.WorkspacePage),
  { ssr: false, loading: () => <EmptyWorkspace /> }
);

/**
 * The provider is above the shell, so the sidebar knows from the start which
 * document is open and opens another in place. It reads what the workspace is
 * open on from the URL's search params with no Suspense boundary above it,
 * which only a prerendered page needs: this one is rendered on request, as
 * every page is (the root layout reads the session). A boundary here would
 * have the server send a second shell as its fallback, and swap it in.
 */
export function WorkspaceClient() {
  return (
    <AIModeProvider>
      <PageLayout fullBleed>
        <WorkspacePage />
      </PageLayout>
    </AIModeProvider>
  );
}
