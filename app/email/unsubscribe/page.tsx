import { Metadata } from 'next';
import { EmailUnsubscribeForm } from './EmailUnsubscribeForm';

export const metadata: Metadata = {
  title: 'Unsubscribe from emails',
  description: 'Manage your ResearchHub email subscription.',
  robots: {
    index: false,
    follow: false,
  },
};

interface EmailUnsubscribePageProps {
  searchParams: Promise<{
    code?: string | string[];
  }>;
}

export default async function EmailUnsubscribePage({ searchParams }: EmailUnsubscribePageProps) {
  const { code } = await searchParams;
  const unsubscribeCode = typeof code === 'string' ? code : '';

  return <EmailUnsubscribeForm code={unsubscribeCode} />;
}
