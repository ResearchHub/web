import { notFound, redirect } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { generateSlug } from '@/utils/url';

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

  try {
    const payload = await PostService.getRegisteredReportWork(id);
    redirect(`/report/${id}/${payload.work.slug || generateSlug(payload.work.title)}`);
  } catch {
    notFound();
  }
}
