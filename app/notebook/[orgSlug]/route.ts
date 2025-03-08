import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * GET route handler that redirects to the main /notebook page while preserving the orgSlug parameter if present.
 */
export async function GET(request: Request, { params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;

  // Redirect to the notebook page with the orgSlug as a query parameter if it exists
  if (orgSlug) {
    redirect(`/notebook?orgSlug=${orgSlug}`);
  } else {
    redirect('/notebook');
  }
}
