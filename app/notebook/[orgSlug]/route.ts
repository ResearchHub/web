import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * A dumb GET route handler that simply redirects to the main /notebook page.
 */
export async function GET() {
  redirect('/notebook');
}
