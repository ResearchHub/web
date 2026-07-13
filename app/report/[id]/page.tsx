import { notFound, redirect } from 'next/navigation';
import { generateSlug } from '@/utils/url';
import { getRegisteredReportWorkOrNotFound } from '@/components/work/registeredReportRouteServer';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportWithoutSlugPage({ params }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  const payload = await getRegisteredReportWorkOrNotFound(id);
  const path = `/report/${id}/${payload.work.slug || generateSlug(payload.work.title)}`;
  redirect(path);
}
