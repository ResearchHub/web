import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { OrganizationService } from '@/services/organization.service';
import { NoteService } from '@/services/note.service';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import rfpTemplate from '@/components/Editor/lib/data/rfpTemplate';
import { getInitialContent, initialContent } from '@/components/Editor/lib/data/initialContent';
import { getDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
import { selectOrganization } from '@/contexts/utils/organizationSelection';
// These settings ensure our notebook route always gets fresh data and never uses cached responses.
export const dynamic = 'force-dynamic'; // Disable static optimization, ensuring fresh data on every request
export const fetchCache = 'force-no-store'; // Prevent Next.js from caching fetch requests inside this route
export const revalidate = 0; // Disable automatic background revalidation since we want truly dynamic behavior

async function createNoteWithContent(
  orgSlug: string,
  {
    template,
    queryParam,
    queryValue,
  }: {
    template: typeof preregistrationTemplate | typeof initialContent | typeof rfpTemplate;
    queryParam?: string;
    queryValue?: string;
  }
) {
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

  const queryString = queryParam && queryValue ? `?${queryParam}=${queryValue}` : '';
  return redirect(`/notebook/${orgSlug}/${newNote.id}${queryString}`);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect('/auth/signin');
  }

  // Get URL and search params
  const { searchParams } = new URL(request.url);
  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewResearch = searchParams.get('newResearch') === 'true';
  const isNewRfp = searchParams.get('newRfp') === 'true';
  const targetOrgSlug = searchParams.get('orgSlug');

  const organizations = await OrganizationService.getUserOrganizations(session);
  if (!organizations || organizations.length === 0) {
    throw new Error('No organizations found. Please create or join an organization first.');
  }

  const selectedOrg = selectOrganization(organizations, targetOrgSlug);

  //TODO: Handle this better. Not found page
  if (!selectedOrg) {
    throw new Error('No organization found');
  }

  if (isNewFunding) {
    return createNoteWithContent(selectedOrg.slug, {
      template: preregistrationTemplate,
      queryParam: 'newFunding',
      queryValue: 'true',
    });
  } else if (isNewResearch) {
    return createNoteWithContent(selectedOrg.slug, {
      template: getInitialContent('research'),
      queryParam: 'newResearch',
      queryValue: 'true',
    });
  } else if (isNewRfp) {
    return createNoteWithContent(selectedOrg.slug, {
      template: rfpTemplate,
      queryParam: 'newRfp',
      queryValue: 'true',
    });
  }

  const notes = await NoteService.getOrganizationNotes(selectedOrg.slug);

  if (notes.results.length === 0) {
    return createNoteWithContent(selectedOrg.slug, {
      template: initialContent,
    });
  }

  redirect(`/notebook/${selectedOrg.slug}/${notes.results[0].id}`);
}
