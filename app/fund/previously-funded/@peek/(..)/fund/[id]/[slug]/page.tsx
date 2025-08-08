import { FundPeek } from '@/components/peek/FundPeek';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function PeekPreviouslyFundedProjectPage({ params }: Readonly<Props>) {
  const { id } = await params;
  return <FundPeek id={id} />;
}
