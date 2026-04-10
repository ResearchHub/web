import { Metadata } from 'next';
import { ListService } from '@/components/UserList/lib/services/list.service';
import { buildOpenGraphMetadata } from '@/lib/metadata';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    return buildOpenGraphMetadata({
      title: 'Research List',
      description: `A curated research list on ResearchHub.`,
      url: `/list/${id}`,
    });
  } catch {
    return {};
  }
}

export default function ListDetailLayout({ children }: Props) {
  return children;
}
