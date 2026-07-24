import { redirect } from 'next/navigation';
import { generateSlug } from '@/utils/url';
import { getRegisteredReportWorkOrNotFound } from '@/components/work/registeredReportRouteServer';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportWithoutSlugPage({ params }: Props) {
  const { id } = await params;
  const payload = await getRegisteredReportWorkOrNotFound(id);
  const slug = payload.work.slug || generateSlug(payload.work.title) || 'registered-report';
  redirect(buildRegisteredReportUrl(payload.work.id, slug));
}
