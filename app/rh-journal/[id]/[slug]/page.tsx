import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { getReportById } from '../../lib/mockData';
import { RegisteredReportDetail } from '../../components/RegisteredReportDetail';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const report = getReportById(id);

  if (!report) {
    return buildOpenGraphMetadata({
      title: 'Registered Report',
      description: 'ResearchHub Journal of Registered Reports',
      url: `/rh-journal/${id}/${slug}`,
    });
  }

  return buildOpenGraphMetadata({
    title: report.title,
    description: report.abstract,
    url: `/rh-journal/${report.id}/${report.slug}`,
  });
}

export default async function RegisteredReportPage({ params }: Props) {
  const { id } = await params;
  const report = getReportById(id);

  if (!report) {
    notFound();
  }

  return <RegisteredReportDetail report={report} />;
}
