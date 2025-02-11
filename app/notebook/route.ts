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

  // Check if there are any notes
  if (notes.results.length === 0) {
    // If no notes exist, create a new one
    const newNote = await NoteService.createNote({
      organization_slug: defaultOrg.slug,
      title: 'Untitled', //TODO: we might want to set a better default title
      grouping: 'WORKSPACE',
    });

    // Redirect to the newly created note
    redirect(`/notebook/${defaultOrg.slug}/${newNote.id}`);
  }

  // If notes exist, redirect to the first one
  redirect(`/notebook/${defaultOrg.slug}/${notes.results[0].id}`);
}
