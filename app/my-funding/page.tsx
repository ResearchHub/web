import 'cal-sans/index.css';
import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { MyFundingPage } from './components/MyFundingPage';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'My Funding',
  description: 'Manage your RFPs and proposals, track funding activity, and view your earnings.',
  url: '/my-funding',
});

export default function MyFundingRoute() {
  return <MyFundingPage />;
}
