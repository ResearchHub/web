import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { OrganizationService } from '@/services/organization.service';
import { NoteService } from '@/services/note.service';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { initialContent } from '@/components/Editor/lib/data/initialContent';
import { getDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
// These settings ensure our notebook route always gets fresh data and never uses cached responses.
export const dynamic = 'force-dynamic'; // Disable static optimization, ensuring fresh data on every request
export const fetchCache = 'force-no-store'; // Prevent Next.js from caching fetch requests inside this route
export const revalidate = 0; // Disable automatic background revalidation since we want truly dynamic behavior

async function createNoteWithContent(
  orgSlug: string,
  {
    template,
    isNewFunding = false,
  }: {
    template: typeof preregistrationTemplate | typeof initialContent;
    isNewFunding?: boolean;
  }
) {
  // Extract title from the first h1 heading in the template
  const title = getDocumentTitle(template) || 'Untitled';

  const newNote = await NoteService.createNote({
    organization_slug: orgSlug,
    title,
    grouping: 'WORKSPACE',
  });

  await NoteService.updateNoteContent({
    note: newNote.id,
    full_json: JSON.stringify(template),
    plain_text: template.content
      .map((block) => block.content?.map((c) => c.text).join(' '))
      .filter(Boolean)
      .join('\n'),
  });

  return redirect(`/notebook/${orgSlug}/${newNote.id}${isNewFunding ? '?newFunding=true' : ''}`);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect('/auth/signin');
  }

  // Get URL and search params
  const { searchParams } = new URL(request.url);
  const isNewFunding = searchParams.get('newFunding') === 'true';

  const organizations = await OrganizationService.getUserOrganizations(session);
  if (!organizations || organizations.length === 0) {
    throw new Error('No organizations found. Please create or join an organization first.');
  }

  const defaultOrg = organizations[0];
  if (!defaultOrg) {
    throw new Error('No default organization found');
  }

  if (isNewFunding) {
    return createNoteWithContent(defaultOrg.slug, {
      template: preregistrationTemplate,
      isNewFunding: true,
    });
  }

  const notes = await NoteService.getOrganizationNotes(defaultOrg.slug);

  if (notes.results.length === 0) {
    return createNoteWithContent(defaultOrg.slug, {
      template: initialContent,
    });
  }

  redirect(`/notebook/${defaultOrg.slug}/${notes.results[0].id}`);
}
