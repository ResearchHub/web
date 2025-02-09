import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { OrganizationService } from '@/services/organization.service';
import { NoteService } from '@/services/note.service';

// These settings ensure our notebook route always gets fresh data and never uses cached responses.
export const dynamic = 'force-dynamic'; // Disable static optimization, ensuring fresh data on every request
export const fetchCache = 'force-no-store'; // Prevent Next.js from caching fetch requests inside this route
export const revalidate = 0; // Disable automatic background revalidation since we want truly dynamic behavior

export async function GET() {
  const session = await getServerSession(authOptions);
  const organizations = await OrganizationService.getUserOrganizations(session);
  const defaultOrg = organizations[0];

  // Get the organization's notes
  const notes = await NoteService.getOrganizationNotes(defaultOrg.slug);

  // Redirect to the first note
  redirect(`/notebook/${defaultOrg.slug}/${notes.results[0].id}`);
}
