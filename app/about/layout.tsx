import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import {
  generateOrganizationStructuredData,
  generateFAQStructuredData,
} from '@/lib/structured-data';

const faqItems = [
  {
    question: 'What is ResearchHub?',
    answer:
      'ResearchHub is an open platform designed to accelerate the speed and transparency of science. It provides open-access publishing, paid peer review, and a funding marketplace — all in one place.',
  },
  {
    question: "What's wrong with traditional science publishing?",
    answer:
      'Peer reviewers work for free, publishing takes months or years, most research is locked behind paywalls, and grant review processes are slow with much of the funding going to indirect costs rather than experiments.',
  },
  {
    question: 'How does the ResearchHub Funding Marketplace work?',
    answer:
      'Researchers publicly preregister their study design, qualified reviewers critique proposals openly with paid turnaround in under 10 days, funders commit capital to approved proposals with low overhead (0–10%), and results are linked back to the original preregistration.',
  },
  {
    question: 'What is ResearchCoin (RSC)?',
    answer:
      'ResearchCoin (RSC) is an ERC20 token on Ethereum that rewards contributions that advance science — including funding research, peer review, replication, and discussion. RSC can be used for bounties, endowments, and self-funding proposals.',
  },
  {
    question: 'How can I fund research on ResearchHub?',
    answer:
      'Funders can contribute via RSC, donor-advised funds (DAF) through our partner Endaoment (a 501(c)(3) nonprofit), credit card, or Apple Pay. Donations through Endaoment are tax-deductible.',
  },
];

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'About',
    description:
      'ResearchHub accelerates science with open-access publishing, paid peer review, and a transparent funding marketplace. Learn about our mission, features, and team.',
    url: '/about',
  }),
  title: {
    default: 'About',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  keywords: [
    'ResearchHub',
    'open science',
    'open access',
    'peer review',
    'research funding',
    'ResearchCoin',
    'RSC',
    'science publishing',
    'preregistration',
    'reproducibility',
  ],
  other: {
    'application/ld+json': JSON.stringify([
      generateOrganizationStructuredData(),
      generateFAQStructuredData(faqItems),
    ]),
  },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
