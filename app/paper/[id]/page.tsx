import { handleMissingSlugRedirect } from '@/utils/navigation';
import { getPaper } from '@/app/paper/getPaper';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaperRedirectPage({ params }: Props) {
  const { id } = await params;
  const paper = await getPaper(id);

  handleMissingSlugRedirect(paper, id, 'paper');
}
