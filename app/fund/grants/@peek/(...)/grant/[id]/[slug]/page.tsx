import { GrantPeek } from '@/components/peek/GrantPeek';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function PeekGrantPage({ params }: Readonly<Props>) {
  const { id } = await params;
  return <GrantPeek id={id} closeHref="/fund/grants" />;
}
