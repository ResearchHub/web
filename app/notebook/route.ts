import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { OrganizationService } from '@/services/organization.service';
import { NoteService } from '@/services/note.service';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { getInitialContent, initialContent } from '@/components/Editor/lib/data/initialContent';
// These settings ensure our notebook route always gets fresh data and never uses cached responses.
export const dynamic = 'force-dynamic'; // Disable static optimization, ensuring fresh data on every request
export const fetchCache = 'force-no-store'; // Prevent Next.js from caching fetch requests inside this route
export const revalidate = 0; // Disable automatic background revalidation since we want truly dynamic behavior

export async function GET(request: Request) {
  // Get URL and search params
  const { searchParams } = new URL(request.url);
  const isNewFunding = searchParams.get('newFunding') === 'true';

  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('You must be signed in to access this page');
  }

  const organizations = await OrganizationService.getUserOrganizations(session);
  if (!organizations || organizations.length === 0) {
    throw new Error('No organizations found. Please create or join an organization first.');
  }

  const defaultOrg = organizations[0];
  if (!defaultOrg) {
    throw new Error('No default organization found');
  }

  // If newFunding is true, create a new note
  if (isNewFunding) {
    const newNote = await NoteService.createNote({
      organization_slug: defaultOrg.slug,
      title: 'New Research Funding Proposal',
      grouping: 'WORKSPACE',
    });

    const note = await NoteService.createNote({
      title: 'New Research Funding Proposal',
      grouping: 'WORKSPACE',
      organization_slug: defaultOrg.slug,
    });

    // Update the note with the preregistration template
    await NoteService.updateNoteContent({
      note: note.id,
      full_json: JSON.stringify(preregistrationTemplate),
      plain_text: preregistrationTemplate.content
        .map((block) => block.content?.map((c) => c.text).join(' '))
        .filter(Boolean)
        .join('\n'),
    });

    redirect(`/notebook/${defaultOrg.slug}/${newNote.id}?newFunding=true`);
  }

  // Otherwise, proceed with normal flow
  const notes = await NoteService.getOrganizationNotes(defaultOrg.slug);

  // Check if there are any notes
  if (notes.results.length === 0) {
    // If no notes exist, create a new one
    const newNote = await NoteService.createNote({
      organization_slug: defaultOrg.slug,
      title: 'Untitled',
      grouping: 'WORKSPACE',
    });

    // Update the note with the preregistration template
    await NoteService.updateNoteContent({
      note: newNote.id,
      full_json: JSON.stringify(initialContent),
      plain_text: getInitialContent()
        .content.map((block) => block.content?.map((c) => c.text).join(' '))
        .filter(Boolean)
        .join('\n'),
    });

    redirect(`/notebook/${defaultOrg.slug}/${newNote.id}`);
  }

  // If notes exist, redirect to the first one
  redirect(`/notebook/${defaultOrg.slug}/${notes.results[0].id}`);
}
