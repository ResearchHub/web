import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { generateFAQStructuredData } from '@/lib/structured-data';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';

const faqItems = [
  {
    question: 'Is content created on ResearchHub open?',
    answer:
      'Yes. User contributions to ResearchHub are shared under the Creative Commons Attribution License (CC BY 4.0), allowing anyone to reuse the content for any purpose with attribution.',
  },
  {
    question: 'What papers can I legally upload to ResearchHub?',
    answer:
      'Users can create a ResearchHub page for any paper. However, only papers released under CC BY or CC0 open licenses are eligible for fulltext PDF upload.',
  },
  {
    question: 'Who created this site?',
    answer:
      'ResearchHub is being developed by a small team of passionate founders working in San Francisco, CA.',
  },
  {
    question: 'How can I help?',
    answer:
      'Sign in, upload a paper, write or edit a summary, upvote or downvote papers, start a discussion, or follow us on Twitter.',
  },
];

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'About',
    description: 'Learn more about ResearchHub, our mission, and the team behind the platform.',
    url: '/about',
  }),
  title: {
    default: 'About',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  other: {
    'application/ld+json': JSON.stringify(generateFAQStructuredData(faqItems)),
  },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="grid min-h-screen w-full"
        style={{
          gridTemplateColumns: '70px minmax(0, 1fr)',
        }}
      >
        {/* Main Left Sidebar - 70px fixed width (minimized) */}
        <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
          <MainLeftSidebar forceMinimize={true} />
        </div>

        {/* Main Content Area */}
        <main className="relative">{children}</main>
      </div>
    </div>
  );
}
