import 'cal-sans/index.css';
import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { MyFundingPage } from './components/MyFundingPage';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'My Funding',
  description: 'Track the funding you give and the earnings you receive.',
  url: '/my-funding',
});

export default function MyFundingRoute() {
  return <MyFundingPage />;
}
