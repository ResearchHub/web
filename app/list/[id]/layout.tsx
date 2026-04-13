import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

interface GenerateMetadataProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { id } = await params;
  return buildOpenGraphMetadata({
    title: 'Research List',
    description: 'A curated research list on ResearchHub.',
    url: `/list/${id}`,
  });
}

export default function ListDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
