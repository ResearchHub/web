import { Metadata } from 'next';
import ExpertFinderClientLayout from './ExpertFinderClientLayout';

export const metadata: Metadata = {
  title: 'Expert Finder',
};

export default function ExpertFinderLayout({ children }: { children: React.ReactNode }) {
  return <ExpertFinderClientLayout>{children}</ExpertFinderClientLayout>;
}
