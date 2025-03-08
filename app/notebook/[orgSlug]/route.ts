import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * GET route handler that redirects to the main /notebook page while preserving the orgSlug parameter if present.
 */
export async function GET(request: NextRequest, { params }: { params: { orgSlug: string } }) {
  const orgSlug = params.orgSlug;

  // Redirect to the notebook page with the orgSlug as a query parameter if it exists
  if (orgSlug) {
    redirect(`/notebook?orgSlug=${orgSlug}`);
  } else {
    redirect('/notebook');
  }
}
