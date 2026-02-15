import { Grant } from '@/types/grant';
import { Fundraise } from '@/types/funding';
import { FundingActivity } from '@/types/fundingActivity';
import { AuthorProfile } from '@/types/authorProfile';
import { FundingOrganization } from '@/types/fundingOrganization';

// ─── Funding Topics ──────────────────────────────────────────────────────
export const FUNDING_TOPICS = [
  { id: 'all', label: 'All' },
  { id: 'open-science', label: 'Open Science' },
  { id: 'ai-ml', label: 'AI & Machine Learning' },
  { id: 'climate', label: 'Climate & Environment' },
  { id: 'medicine', label: 'Medicine & Health' },
  { id: 'neuroscience', label: 'Neuroscience' },
  { id: 'genomics', label: 'Genomics & Genetics' },
  { id: 'physics', label: 'Physics' },
  { id: 'computer-science', label: 'Computer Science' },
  { id: 'biology', label: 'Biology' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'materials-science', label: 'Materials Science' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'economics', label: 'Economics' },
  { id: 'public-health', label: 'Public Health' },
  { id: 'mathematics', label: 'Mathematics' },
] as const;

export type FundingTopic = typeof FUNDING_TOPICS[number]['id'];

// ─── Mock Author Profiles ────────────────────────────────────────────────
const mockAuthors: AuthorProfile[] = [
  {
    id: 1,
    fullName: 'Dr. Sarah Chen',
    firstName: 'Sarah',
    lastName: 'Chen',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    headline: 'Computational Biology @ Stanford',
    profileUrl: '/author/1',
    isClaimed: true,
    isVerified: true,
  },
  {
    id: 2,
    fullName: 'Prof. James Martinez',
    firstName: 'James',
    lastName: 'Martinez',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    headline: 'Neuroscience Researcher @ MIT',
    profileUrl: '/author/2',
    isClaimed: true,
    isVerified: true,
  },
  {
    id: 3,
    fullName: 'Dr. Emily Watson',
    firstName: 'Emily',
    lastName: 'Watson',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    headline: 'Climate Science @ UC Berkeley',
    profileUrl: '/author/3',
    isClaimed: true,
    isVerified: false,
  },
  {
    id: 4,
    fullName: 'Dr. Michael Park',
    firstName: 'Michael',
    lastName: 'Park',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    headline: 'AI/ML Research @ DeepMind',
    profileUrl: '/author/4',
    isClaimed: true,
    isVerified: true,
  },
  {
    id: 5,
    fullName: 'Dr. Lisa Thompson',
    firstName: 'Lisa',
    lastName: 'Thompson',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    headline: 'Molecular Biology @ Harvard',
    profileUrl: '/author/5',
    isClaimed: true,
    isVerified: false,
  },
  {
    id: 6,
    fullName: 'Prof. David Kim',
    firstName: 'David',
    lastName: 'Kim',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    headline: 'Quantum Computing @ Caltech',
    profileUrl: '/author/6',
    isClaimed: true,
    isVerified: true,
  },
];

// ─── Mock Grants (Funding Opportunities) ─────────────────────────────────
export type MockGrant = Grant & { topic: FundingTopic };

export const mockGrants: MockGrant[] = [
  {
    id: 1,
    topic: 'open-science',
    title: 'Open Science Accelerator for Reproducibility and Data Sharing 2026',
    createdBy: {
      id: 100,
      authorProfile: mockAuthors[0],
      firstName: 'ResearchHub',
      lastName: 'Foundation',
    },
    amount: {
      usd: 500000,
      rsc: 2500000,
      formatted: '$500,000',
    },
    currency: 'USD',
    organization: 'ResearchHub Foundation',
    description: 'Supporting groundbreaking open science initiatives that advance reproducibility and accessibility in research.',
    status: 'OPEN',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    contacts: [],
  },
  {
    id: 2,
    topic: 'climate',
    title: 'Climate Research Initiative',
    createdBy: {
      id: 101,
      authorProfile: mockAuthors[2],
      firstName: 'Green',
      lastName: 'Fund',
    },
    amount: {
      usd: 750000,
      rsc: 3750000,
      formatted: '$750,000',
    },
    currency: 'USD',
    organization: 'Climate Action Foundation',
    description: 'Funding innovative research projects addressing climate change mitigation and adaptation strategies.',
    status: 'OPEN',
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    contacts: [],
  },
  {
    id: 3,
    topic: 'ai-ml',
    title: 'AI Safety Research Grant',
    createdBy: {
      id: 102,
      authorProfile: mockAuthors[3],
      firstName: 'AI',
      lastName: 'Safety Institute',
    },
    amount: {
      usd: 1000000,
      rsc: 5000000,
      formatted: '$1,000,000',
    },
    currency: 'USD',
    organization: 'AI Safety Institute',
    description: 'Supporting research into alignment, interpretability, and safety of advanced AI systems.',
    status: 'OPEN',
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    contacts: [],
  },
  {
    id: 4,
    topic: 'medicine',
    title: 'Biomedical Innovation Fund for Rare Diseases and Neglected Therapeutics',
    createdBy: {
      id: 103,
      authorProfile: mockAuthors[4],
      firstName: 'Health',
      lastName: 'Innovations',
    },
    amount: {
      usd: 300000,
      rsc: 1500000,
      formatted: '$300,000',
    },
    currency: 'USD',
    organization: 'Health Innovations Inc',
    description: 'Accelerating biomedical research with a focus on rare diseases and novel therapeutic approaches.',
    status: 'OPEN',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    contacts: [],
  },
  {
    id: 5,
    topic: 'neuroscience',
    title: 'Neuroscience Discovery Program',
    createdBy: {
      id: 104,
      authorProfile: mockAuthors[1],
      firstName: 'Brain',
      lastName: 'Research Foundation',
    },
    amount: {
      usd: 600000,
      rsc: 3000000,
      formatted: '$600,000',
    },
    currency: 'USD',
    organization: 'Brain Research Foundation',
    description: 'Advancing our understanding of neural circuits, brain development, and neurological disorders through cutting-edge research.',
    status: 'OPEN',
    startDate: '2026-02-01',
    endDate: '2026-10-31',
    contacts: [],
  },
  {
    id: 6,
    topic: 'genomics',
    title: 'Genomics & Precision Medicine Initiative',
    createdBy: {
      id: 105,
      authorProfile: mockAuthors[4],
      firstName: 'Genome',
      lastName: 'Sciences',
    },
    amount: {
      usd: 450000,
      rsc: 2250000,
      formatted: '$450,000',
    },
    currency: 'USD',
    organization: 'Genome Sciences Consortium',
    description: 'Supporting genomic research to advance personalized medicine and improve rare disease diagnostics.',
    status: 'OPEN',
    startDate: '2026-01-15',
    endDate: '2026-09-15',
    contacts: [],
  },
  {
    id: 7,
    topic: 'physics',
    title: 'Quantum Computing Research Fund',
    createdBy: {
      id: 106,
      authorProfile: mockAuthors[5],
      firstName: 'Quantum',
      lastName: 'Initiative',
    },
    amount: {
      usd: 800000,
      rsc: 4000000,
      formatted: '$800,000',
    },
    currency: 'USD',
    organization: 'National Quantum Initiative',
    description: 'Funding breakthrough research in quantum computing, error correction, and quantum algorithms.',
    status: 'OPEN',
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    contacts: [],
  },
  {
    id: 8,
    topic: 'public-health',
    title: 'Global Health Resilience Fund',
    createdBy: {
      id: 107,
      authorProfile: mockAuthors[2],
      firstName: 'Global',
      lastName: 'Health',
    },
    amount: {
      usd: 550000,
      rsc: 2750000,
      formatted: '$550,000',
    },
    currency: 'USD',
    organization: 'World Health Research Foundation',
    description: 'Strengthening global health systems through innovative research in disease surveillance and prevention.',
    status: 'OPEN',
    startDate: '2026-02-15',
    endDate: '2026-11-30',
    contacts: [],
  },
];

// ─── Mock Fundraises (Proposals) ─────────────────────────────────────────
export const mockFundraises: (Fundraise & { 
  title: string; 
  description: string; 
  authors: AuthorProfile[];
  previewImage?: string;
  grantId: number;
})[] = [
  // Grant 1: Open Science Accelerator
  {
    id: 101,
    grantId: 1,
    title: 'Reproducibility Toolkit for Machine Learning Research',
    description: 'Building an open-source toolkit that enables researchers to easily reproduce and verify ML experiments.',
    authors: [mockAuthors[0], mockAuthors[3]],
    previewImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 50000, rsc: 250000 },
    amountRaised: { usd: 32500, rsc: 162500 },
    startDate: '2026-01-15',
    endDate: '2026-05-15',
    contributors: {
      numContributors: 24,
      topContributors: [
        { id: 1, authorProfile: mockAuthors[1], totalContribution: 5000, contributions: [] },
        { id: 2, authorProfile: mockAuthors[2], totalContribution: 3000, contributions: [] },
      ],
    },
    createdDate: '2026-01-15',
    updatedDate: '2026-02-10',
  },
  {
    id: 102,
    grantId: 1,
    title: 'Open Data Standards for Scientific Publishing',
    description: 'Developing universal data sharing standards to improve scientific transparency and collaboration.',
    authors: [mockAuthors[1]],
    previewImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 75000, rsc: 375000 },
    amountRaised: { usd: 18750, rsc: 93750 },
    startDate: '2026-01-20',
    endDate: '2026-06-20',
    contributors: {
      numContributors: 12,
      topContributors: [
        { id: 3, authorProfile: mockAuthors[4], totalContribution: 2500, contributions: [] },
      ],
    },
    createdDate: '2026-01-20',
    updatedDate: '2026-02-08',
  },
  {
    id: 103,
    grantId: 1,
    title: 'Peer Review Automation with AI',
    description: 'Creating AI tools to assist peer reviewers in identifying methodological issues and improving review quality.',
    authors: [mockAuthors[3], mockAuthors[5]],
    previewImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 60000, rsc: 300000 },
    amountRaised: { usd: 45000, rsc: 225000 },
    startDate: '2026-02-01',
    endDate: '2026-05-30',
    contributors: {
      numContributors: 31,
      topContributors: [
        { id: 4, authorProfile: mockAuthors[0], totalContribution: 8000, contributions: [] },
        { id: 5, authorProfile: mockAuthors[2], totalContribution: 5000, contributions: [] },
      ],
    },
    createdDate: '2026-02-01',
    updatedDate: '2026-02-12',
  },
  // Grant 2: Climate Research Initiative
  {
    id: 201,
    grantId: 2,
    title: 'Carbon Capture Monitoring via Satellite Imagery',
    description: 'Using machine learning on satellite data to track and verify carbon capture effectiveness globally.',
    authors: [mockAuthors[2]],
    previewImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 100000, rsc: 500000 },
    amountRaised: { usd: 67000, rsc: 335000 },
    startDate: '2026-02-05',
    endDate: '2026-07-05',
    contributors: {
      numContributors: 45,
      topContributors: [
        { id: 6, authorProfile: mockAuthors[1], totalContribution: 10000, contributions: [] },
        { id: 7, authorProfile: mockAuthors[5], totalContribution: 7500, contributions: [] },
      ],
    },
    createdDate: '2026-02-05',
    updatedDate: '2026-02-11',
  },
  {
    id: 202,
    grantId: 2,
    title: 'Ocean Acidification Early Warning System',
    description: 'Deploying IoT sensors and predictive models to monitor and forecast ocean acidification events.',
    authors: [mockAuthors[4], mockAuthors[2]],
    previewImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 85000, rsc: 425000 },
    amountRaised: { usd: 21250, rsc: 106250 },
    startDate: '2026-02-10',
    endDate: '2026-08-10',
    contributors: {
      numContributors: 18,
      topContributors: [
        { id: 8, authorProfile: mockAuthors[0], totalContribution: 4000, contributions: [] },
      ],
    },
    createdDate: '2026-02-10',
    updatedDate: '2026-02-12',
  },
  {
    id: 203,
    grantId: 2,
    title: 'Urban Heat Island Mitigation Strategies',
    description: 'Researching green infrastructure solutions to reduce urban heat island effects in major cities.',
    authors: [mockAuthors[1], mockAuthors[4]],
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 55000, rsc: 275000 },
    amountRaised: { usd: 38500, rsc: 192500 },
    startDate: '2026-02-08',
    endDate: '2026-06-30',
    contributors: {
      numContributors: 27,
      topContributors: [
        { id: 9, authorProfile: mockAuthors[3], totalContribution: 6000, contributions: [] },
        { id: 10, authorProfile: mockAuthors[5], totalContribution: 4500, contributions: [] },
      ],
    },
    createdDate: '2026-02-08',
    updatedDate: '2026-02-13',
  },
  // Grant 3: AI Safety Research
  {
    id: 301,
    grantId: 3,
    title: 'Interpretable Neural Network Architectures',
    description: 'Developing novel neural network designs that provide human-understandable explanations for their decisions.',
    authors: [mockAuthors[3]],
    previewImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 120000, rsc: 600000 },
    amountRaised: { usd: 96000, rsc: 480000 },
    startDate: '2026-01-20',
    endDate: '2026-12-20',
    contributors: {
      numContributors: 56,
      topContributors: [
        { id: 11, authorProfile: mockAuthors[0], totalContribution: 15000, contributions: [] },
        { id: 12, authorProfile: mockAuthors[1], totalContribution: 12000, contributions: [] },
      ],
    },
    createdDate: '2026-01-20',
    updatedDate: '2026-02-10',
  },
  {
    id: 302,
    grantId: 3,
    title: 'AI Alignment Benchmarks',
    description: 'Creating standardized benchmarks to measure and compare AI alignment across different model architectures.',
    authors: [mockAuthors[5], mockAuthors[3]],
    previewImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 80000, rsc: 400000 },
    amountRaised: { usd: 24000, rsc: 120000 },
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    contributors: {
      numContributors: 22,
      topContributors: [
        { id: 13, authorProfile: mockAuthors[2], totalContribution: 5000, contributions: [] },
      ],
    },
    createdDate: '2026-02-01',
    updatedDate: '2026-02-09',
  },
  // Grant 4: Biomedical Innovation
  {
    id: 401,
    grantId: 4,
    title: 'CRISPR Delivery Optimization for Rare Diseases',
    description: 'Improving CRISPR delivery mechanisms to increase efficacy in treating rare genetic disorders.',
    authors: [mockAuthors[4]],
    previewImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 90000, rsc: 450000 },
    amountRaised: { usd: 54000, rsc: 270000 },
    startDate: '2026-03-01',
    endDate: '2026-09-01',
    contributors: {
      numContributors: 33,
      topContributors: [
        { id: 14, authorProfile: mockAuthors[1], totalContribution: 8000, contributions: [] },
        { id: 15, authorProfile: mockAuthors[0], totalContribution: 6000, contributions: [] },
      ],
    },
    createdDate: '2026-03-01',
    updatedDate: '2026-02-12',
  },
  {
    id: 402,
    grantId: 4,
    title: 'AI-Powered Drug Discovery Platform',
    description: 'Building an ML platform to accelerate identification of therapeutic compounds for neglected diseases.',
    authors: [mockAuthors[0], mockAuthors[4]],
    previewImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 70000, rsc: 350000 },
    amountRaised: { usd: 14000, rsc: 70000 },
    startDate: '2026-03-05',
    endDate: '2026-09-15',
    contributors: {
      numContributors: 9,
      topContributors: [
        { id: 16, authorProfile: mockAuthors[3], totalContribution: 3500, contributions: [] },
      ],
    },
    createdDate: '2026-03-05',
    updatedDate: '2026-02-13',
  },
  // Grant 5: Neuroscience Discovery
  {
    id: 601,
    grantId: 5,
    title: 'Neural Circuit Mapping with Advanced Imaging',
    description: 'Developing next-generation imaging techniques for comprehensive mapping of neural circuits in the mammalian brain.',
    authors: [mockAuthors[1]],
    previewImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 80000, rsc: 400000 },
    amountRaised: { usd: 48000, rsc: 240000 },
    startDate: '2026-02-10',
    endDate: '2026-08-10',
    contributors: {
      numContributors: 29,
      topContributors: [
        { id: 21, authorProfile: mockAuthors[0], totalContribution: 7000, contributions: [] },
      ],
    },
    createdDate: '2026-02-10',
    updatedDate: '2026-02-13',
  },
  {
    id: 602,
    grantId: 5,
    title: 'Brain-Computer Interface for Motor Recovery',
    description: 'Building non-invasive BCI systems to restore motor function in patients with spinal cord injuries.',
    authors: [mockAuthors[3], mockAuthors[1]],
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 95000, rsc: 475000 },
    amountRaised: { usd: 28500, rsc: 142500 },
    startDate: '2026-02-15',
    endDate: '2026-09-15',
    contributors: {
      numContributors: 15,
      topContributors: [
        { id: 22, authorProfile: mockAuthors[5], totalContribution: 5000, contributions: [] },
      ],
    },
    createdDate: '2026-02-15',
    updatedDate: '2026-02-14',
  },
  // Grant 6: Genomics
  {
    id: 603,
    grantId: 6,
    title: 'Population-Scale Genomic Analysis Pipeline',
    description: 'Creating scalable computational pipelines for analyzing genomic data across diverse populations.',
    authors: [mockAuthors[4]],
    previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 65000, rsc: 325000 },
    amountRaised: { usd: 39000, rsc: 195000 },
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    contributors: {
      numContributors: 21,
      topContributors: [
        { id: 23, authorProfile: mockAuthors[2], totalContribution: 6000, contributions: [] },
      ],
    },
    createdDate: '2026-02-01',
    updatedDate: '2026-02-12',
  },
  {
    id: 604,
    grantId: 6,
    title: 'Epigenetic Markers for Early Disease Detection',
    description: 'Identifying epigenetic biomarkers that enable early diagnosis of complex diseases.',
    authors: [mockAuthors[0], mockAuthors[4]],
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 55000, rsc: 275000 },
    amountRaised: { usd: 11000, rsc: 55000 },
    startDate: '2026-02-10',
    endDate: '2026-08-31',
    contributors: {
      numContributors: 8,
      topContributors: [
        { id: 24, authorProfile: mockAuthors[1], totalContribution: 3000, contributions: [] },
      ],
    },
    createdDate: '2026-02-10',
    updatedDate: '2026-02-13',
  },
  // Grant 7: Quantum Computing
  {
    id: 605,
    grantId: 7,
    title: 'Quantum Error Correction for NISQ Devices',
    description: 'Developing practical error correction codes optimized for near-term quantum computing hardware.',
    authors: [mockAuthors[5]],
    previewImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 110000, rsc: 550000 },
    amountRaised: { usd: 77000, rsc: 385000 },
    startDate: '2026-03-05',
    endDate: '2026-12-05',
    contributors: {
      numContributors: 37,
      topContributors: [
        { id: 25, authorProfile: mockAuthors[3], totalContribution: 10000, contributions: [] },
        { id: 26, authorProfile: mockAuthors[0], totalContribution: 8000, contributions: [] },
      ],
    },
    createdDate: '2026-03-05',
    updatedDate: '2026-02-14',
  },
  {
    id: 606,
    grantId: 7,
    title: 'Topological Quantum Computing Materials',
    description: 'Exploring new materials that exhibit topological properties suitable for fault-tolerant quantum computation.',
    authors: [mockAuthors[5], mockAuthors[2]],
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 85000, rsc: 425000 },
    amountRaised: { usd: 17000, rsc: 85000 },
    startDate: '2026-03-10',
    endDate: '2026-11-30',
    contributors: {
      numContributors: 11,
      topContributors: [
        { id: 27, authorProfile: mockAuthors[1], totalContribution: 4000, contributions: [] },
      ],
    },
    createdDate: '2026-03-10',
    updatedDate: '2026-02-14',
  },
  // Grant 8: Public Health
  {
    id: 607,
    grantId: 8,
    title: 'AI-Powered Epidemic Early Warning System',
    description: 'Using machine learning and epidemiological models to predict and track disease outbreaks globally.',
    authors: [mockAuthors[2], mockAuthors[3]],
    previewImage: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&h=300&fit=crop',
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 75000, rsc: 375000 },
    amountRaised: { usd: 52500, rsc: 262500 },
    startDate: '2026-02-20',
    endDate: '2026-10-31',
    contributors: {
      numContributors: 34,
      topContributors: [
        { id: 28, authorProfile: mockAuthors[4], totalContribution: 8000, contributions: [] },
        { id: 29, authorProfile: mockAuthors[0], totalContribution: 5000, contributions: [] },
      ],
    },
    createdDate: '2026-02-20',
    updatedDate: '2026-02-14',
  },
  {
    id: 608,
    grantId: 8,
    title: 'Community Health Monitoring Dashboard',
    description: 'Building open-source tools for real-time community health monitoring and resource allocation.',
    authors: [mockAuthors[1], mockAuthors[4]],
    status: 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: 45000, rsc: 225000 },
    amountRaised: { usd: 9000, rsc: 45000 },
    startDate: '2026-02-25',
    endDate: '2026-09-30',
    contributors: {
      numContributors: 7,
      topContributors: [
        { id: 30, authorProfile: mockAuthors[5], totalContribution: 2500, contributions: [] },
      ],
    },
    createdDate: '2026-02-25',
    updatedDate: '2026-02-14',
  },
  // Completed fundraises
  {
    id: 501,
    grantId: 1,
    title: 'Open Source Research Platform Development',
    description: 'Completed project that built a collaborative platform for open science research and data sharing.',
    authors: [mockAuthors[5], mockAuthors[1]],
    previewImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    status: 'COMPLETED',
    goalCurrency: 'USD',
    goalAmount: { usd: 40000, rsc: 200000 },
    amountRaised: { usd: 40000, rsc: 200000 },
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    contributors: {
      numContributors: 42,
      topContributors: [
        { id: 17, authorProfile: mockAuthors[2], totalContribution: 7000, contributions: [] },
        { id: 18, authorProfile: mockAuthors[4], totalContribution: 5500, contributions: [] },
      ],
    },
    createdDate: '2025-10-01',
    updatedDate: '2026-02-01',
  },
  {
    id: 502,
    grantId: 2,
    title: 'Renewable Energy Grid Optimization Study',
    description: 'Successfully completed research on machine learning optimization for renewable energy distribution.',
    authors: [mockAuthors[2], mockAuthors[0]],
    previewImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
    status: 'COMPLETED',
    goalCurrency: 'USD',
    goalAmount: { usd: 65000, rsc: 325000 },
    amountRaised: { usd: 68000, rsc: 340000 },
    startDate: '2025-09-15',
    endDate: '2026-02-10',
    contributors: {
      numContributors: 38,
      topContributors: [
        { id: 19, authorProfile: mockAuthors[3], totalContribution: 9000, contributions: [] },
        { id: 20, authorProfile: mockAuthors[5], totalContribution: 6500, contributions: [] },
      ],
    },
    createdDate: '2025-09-15',
    updatedDate: '2026-02-10',
  },
];

// ─── Mock Funding Activity Feed ──────────────────────────────────────────
export const mockFundingActivities: FundingActivity[] = [
  // Recent activities (most recent first)
  {
    id: 1,
    type: 'funding_contribution',
    createdDate: '2026-02-13T14:30:00Z',
    actor: mockAuthors[1],
    targetTitle: 'Interpretable Neural Network Architectures',
    targetId: 301,
    targetType: 'fundraise',
    contributionAmount: { usd: 2500, rsc: 12500 },
    grantId: 3,
    grantTitle: 'AI Safety Research Grant',
  },
  {
    id: 2,
    type: 'peer_review',
    createdDate: '2026-02-13T12:15:00Z',
    actor: mockAuthors[5],
    targetTitle: 'Reproducibility Toolkit for Machine Learning Research',
    targetId: 101,
    targetType: 'fundraise',
    reviewScore: 8,
    grantId: 1,
    grantTitle: 'Open Science Accelerator 2026',
  },
  {
    id: 3,
    type: 'comment',
    createdDate: '2026-02-13T10:45:00Z',
    actor: mockAuthors[2],
    targetTitle: 'Carbon Capture Monitoring via Satellite Imagery',
    targetId: 201,
    targetType: 'fundraise',
    commentPreview: 'Excellent methodology! Have you considered integrating with existing monitoring stations for validation?',
    grantId: 2,
    grantTitle: 'Climate Research Initiative',
  },
  {
    id: 4,
    type: 'project_update',
    createdDate: '2026-02-13T09:00:00Z',
    actor: mockAuthors[3],
    targetTitle: 'Peer Review Automation with AI',
    targetId: 103,
    targetType: 'fundraise',
    updateTitle: 'Milestone 2 Completed: Initial Model Training',
    grantId: 1,
    grantTitle: 'Open Science Accelerator 2026',
  },
  {
    id: 5,
    type: 'funding_contribution',
    createdDate: '2026-02-12T18:20:00Z',
    actor: mockAuthors[0],
    targetTitle: 'CRISPR Delivery Optimization for Rare Diseases',
    targetId: 401,
    targetType: 'fundraise',
    contributionAmount: { usd: 1500, rsc: 7500 },
    grantId: 4,
    grantTitle: 'Biomedical Innovation Fund',
  },
  {
    id: 6,
    type: 'peer_review',
    createdDate: '2026-02-12T15:30:00Z',
    actor: mockAuthors[1],
    targetTitle: 'Ocean Acidification Early Warning System',
    targetId: 202,
    targetType: 'fundraise',
    reviewScore: 9,
    grantId: 2,
    grantTitle: 'Climate Research Initiative',
  },
  {
    id: 7,
    type: 'comment',
    createdDate: '2026-02-12T11:00:00Z',
    actor: mockAuthors[4],
    targetTitle: 'AI Alignment Benchmarks',
    targetId: 302,
    targetType: 'fundraise',
    commentPreview: 'This is exactly what the field needs. Looking forward to seeing the results!',
    grantId: 3,
    grantTitle: 'AI Safety Research Grant',
  },
  {
    id: 8,
    type: 'funding_contribution',
    createdDate: '2026-02-11T16:45:00Z',
    actor: mockAuthors[5],
    targetTitle: 'Urban Heat Island Mitigation Strategies',
    targetId: 203,
    targetType: 'fundraise',
    contributionAmount: { usd: 3000, rsc: 15000 },
    grantId: 2,
    grantTitle: 'Climate Research Initiative',
  },
  {
    id: 9,
    type: 'project_update',
    createdDate: '2026-02-11T10:00:00Z',
    actor: mockAuthors[2],
    targetTitle: 'Carbon Capture Monitoring via Satellite Imagery',
    targetId: 201,
    targetType: 'fundraise',
    updateTitle: 'First Dataset Collection Complete',
    grantId: 2,
    grantTitle: 'Climate Research Initiative',
  },
  {
    id: 10,
    type: 'peer_review',
    createdDate: '2026-02-10T14:00:00Z',
    actor: mockAuthors[0],
    targetTitle: 'Open Data Standards for Scientific Publishing',
    targetId: 102,
    targetType: 'fundraise',
    reviewScore: 7,
    grantId: 1,
    grantTitle: 'Open Science Accelerator 2026',
  },
  {
    id: 11,
    type: 'funding_contribution',
    createdDate: '2026-02-10T09:30:00Z',
    actor: mockAuthors[3],
    targetTitle: 'AI-Powered Drug Discovery Platform',
    targetId: 402,
    targetType: 'fundraise',
    contributionAmount: { usd: 500, rsc: 2500 },
    grantId: 4,
    grantTitle: 'Biomedical Innovation Fund',
  },
  {
    id: 12,
    type: 'comment',
    createdDate: '2026-02-09T17:15:00Z',
    actor: mockAuthors[1],
    targetTitle: 'Interpretable Neural Network Architectures',
    targetId: 301,
    targetType: 'fundraise',
    commentPreview: 'The approach to layer-wise attribution is innovative. Would love to see benchmarks against existing methods.',
    grantId: 3,
    grantTitle: 'AI Safety Research Grant',
  },
];

// Helper function to filter activities by grant
export const getActivitiesByGrantId = (grantId: number | null): FundingActivity[] => {
  if (grantId === null) {
    return mockFundingActivities;
  }
  return mockFundingActivities.filter(activity => activity.grantId === grantId);
};

// Helper function to get fundraises by grant
export const getFundraisesByGrantId = (grantId: number | null) => {
  if (grantId === null) {
    return mockFundraises;
  }
  return mockFundraises.filter(fundraise => fundraise.grantId === grantId);
};

// ─── Slug Helper ──────────────────────────────────────────────────────────
const toSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Mock Organizations (derived from unique grant organizations) ─────────
export const mockOrganizations: FundingOrganization[] = (() => {
  const orgMap = new Map<string, { name: string; grants: Grant[] }>();

  mockGrants.forEach((grant) => {
    const slug = toSlug(grant.organization);
    if (!orgMap.has(slug)) {
      orgMap.set(slug, { name: grant.organization, grants: [] });
    }
    orgMap.get(slug)!.grants.push(grant);
  });

  return Array.from(orgMap.entries()).map(([slug, { name, grants }]) => {
    const totalUsd = grants.reduce((sum, g) => sum + g.amount.usd, 0);
    const totalRsc = grants.reduce((sum, g) => sum + g.amount.rsc, 0);

    const formatTotal = (usd: number) => {
      if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
      if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
      return `$${usd.toLocaleString()}`;
    };

    return {
      slug,
      name,
      description: `Funding organization providing grants and supporting research.`,
      totalFunding: {
        usd: totalUsd,
        rsc: totalRsc,
        formatted: formatTotal(totalUsd),
      },
      grantCount: grants.length,
    };
  });
})();

// ─── Organization-scoped helpers ──────────────────────────────────────────
export const getGrantsByOrganization = (orgSlug: string): Grant[] =>
  mockGrants.filter((g) => toSlug(g.organization) === orgSlug);

export const getFundraisesByOrganization = (orgSlug: string) => {
  const orgGrantIds = new Set(getGrantsByOrganization(orgSlug).map((g) => g.id));
  return mockFundraises.filter((f) => orgGrantIds.has(f.grantId));
};

export const getActivitiesByOrganization = (orgSlug: string): FundingActivity[] => {
  const orgGrantIds = new Set(
    getGrantsByOrganization(orgSlug).map((g) => g.id)
  );
  return mockFundingActivities.filter(
    (a) => a.grantId !== undefined && orgGrantIds.has(a.grantId as number)
  );
};

export const getOrganizationBySlug = (slug: string): FundingOrganization | undefined =>
  mockOrganizations.find((o) => o.slug === slug);

export const getOrgSlugFromGrantOrganization = (orgName: string): string => toSlug(orgName);

// ─── Topic-based helpers ──────────────────────────────────────────────────
export const getGrantsByTopic = (topic: string): MockGrant[] => {
  if (topic === 'all') return mockGrants;
  return mockGrants.filter((g) => g.topic === topic);
};

export const getFundraisesByTopic = (topic: string) => {
  if (topic === 'all') return mockFundraises;
  const topicGrantIds = new Set(
    mockGrants.filter((g) => g.topic === topic).map((g) => g.id)
  );
  return mockFundraises.filter((f) => topicGrantIds.has(f.grantId));
};

export const getActivitiesByTopic = (topic: string): FundingActivity[] => {
  if (topic === 'all') return mockFundingActivities;
  const topicGrantIds = new Set(
    mockGrants.filter((g) => g.topic === topic).map((g) => g.id)
  );
  return mockFundingActivities.filter(
    (a) => a.grantId !== undefined && topicGrantIds.has(a.grantId as number)
  );
};
