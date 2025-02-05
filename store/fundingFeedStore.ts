import { FeedEntry } from '@/types/feed';
import { users } from './userStore';
import { hubs } from './hubStore';
import dayjs from 'dayjs';

// Helper to generate future dates relative to current date
const baseDate = dayjs();
const futureDate = (days: number) => baseDate.add(days, 'day').toISOString();

export const fundingFeedEntries: FeedEntry[] = [
  {
    id: 'funding-1',
    action: 'publish',
    timestamp: '2024-01-15T10:30:00Z',
    content: {
      id: 'preregistration-1',
      type: 'funding_request',
      status: 'OPEN',
      title: 'Impact of Circadian Rhythms on Learning and Memory Formation',
      abstract:
        'This study investigates how circadian rhythms influence cognitive performance and memory consolidation in young adults using EEG monitoring and cognitive testing.',
      timestamp: '2024-01-15T10:30:00Z',
      topic: hubs.neuroscience,
      amount: 25000,
      goalAmount: 50000,
      deadline: futureDate(30),
      slug: 'circadian-rhythms-learning-memory',
      actor: users.sarahChen,
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800',
      preregistered: true,
    },
    metrics: {
      votes: 45,
      comments: 12,
      reposts: 8,
      saves: 15,
    },
    contributors: [
      {
        profile: users.elenaRodriguez,
        amount: 15000,
      },
      {
        profile: users.dominikus,
        amount: 10000,
      },
    ],
  },
  {
    id: 'funding-2',
    action: 'publish',
    timestamp: '2024-01-14T15:45:00Z',
    content: {
      id: 'preregistration-2',
      type: 'funding_request',
      status: 'OPEN',
      title: 'Novel CRISPR Applications in Treating Rare Genetic Disorders',
      abstract:
        'Developing new CRISPR-based therapeutic approaches for rare genetic disorders, focusing on improving delivery methods and reducing off-target effects.',
      timestamp: '2024-01-14T15:45:00Z',
      topic: hubs.genetics,
      amount: 75000,
      goalAmount: 150000,
      deadline: futureDate(45),
      slug: 'crispr-rare-genetic-disorders',
      actor: users.jamesWilson,
      image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=800',
      preregistered: true,
    },
    metrics: {
      votes: 62,
      comments: 18,
      reposts: 25,
      saves: 30,
    },
    contributors: [
      {
        profile: users.mariaPatel,
        amount: 50000,
      },
      {
        profile: users.alexThompson,
        amount: 25000,
      },
    ],
  },
  {
    id: 'funding-3',
    action: 'publish',
    timestamp: '2024-01-13T09:15:00Z',
    content: {
      id: 'preregistration-3',
      type: 'funding_request',
      status: 'OPEN',
      title: 'Machine Learning for Early Detection of Ocean Pollution',
      abstract:
        'Using machine learning and satellite imagery to develop an early warning system for detecting and tracking ocean pollution sources and spread patterns.',
      timestamp: '2024-01-13T09:15:00Z',
      topic: hubs.environmentalScience,
      amount: 40000,
      goalAmount: 80000,
      deadline: futureDate(60),
      slug: 'ml-ocean-pollution-detection',
      actor: users.mariaGarcia,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
      preregistered: true,
    },
    metrics: {
      votes: 38,
      comments: 9,
      reposts: 12,
      saves: 20,
    },
    contributors: [
      {
        profile: users.davidKumar,
        amount: 30000,
      },
      {
        profile: users.hundessaNemomssa,
        amount: 10000,
      },
    ],
  },
  {
    id: 'funding-4',
    action: 'publish',
    timestamp: '2024-01-12T14:20:00Z',
    content: {
      id: 'preregistration-4',
      type: 'funding_request',
      status: 'OPEN',
      title: 'Quantum Entanglement in Biological Systems',
      abstract:
        'Investigating quantum effects in biological processes, focusing on photosynthesis and bird navigation using cutting-edge quantum sensors.',
      timestamp: '2024-01-12T14:20:00Z',
      topic: hubs.quantumPhysics,
      amount: 85000,
      goalAmount: 200000,
      deadline: futureDate(40),
      slug: 'quantum-entanglement-biological-systems',
      actor: users.alexThompson,
      image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800',
      preregistered: true,
    },
    metrics: {
      votes: 72,
      comments: 25,
      reposts: 18,
      saves: 40,
    },
    contributors: [
      {
        profile: users.dominikus,
        amount: 50000,
      },
      {
        profile: users.sarahChen,
        amount: 35000,
      },
    ],
  },
  {
    id: 'funding-5',
    action: 'publish',
    timestamp: '2024-01-11T09:45:00Z',
    content: {
      id: 'preregistration-5',
      type: 'funding_request',
      status: 'OPEN',
      title: 'AI-Powered Drug Discovery for Rare Diseases',
      abstract:
        'Using machine learning to accelerate drug discovery for rare diseases by combining structural biology and deep learning for compound screening.',
      timestamp: '2024-01-11T09:45:00Z',
      topic: hubs.artificialIntelligence,
      amount: 120000,
      goalAmount: 300000,
      deadline: futureDate(50),
      slug: 'ai-drug-discovery-rare-diseases',
      actor: users.mariaPatel,
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800',
      preregistered: true,
    },
    metrics: {
      votes: 95,
      comments: 32,
      reposts: 28,
      saves: 55,
    },
    contributors: [
      {
        profile: users.elenaRodriguez,
        amount: 70000,
      },
      {
        profile: users.jamesWilson,
        amount: 50000,
      },
    ],
  },
  {
    id: 'funding-6',
    action: 'publish',
    timestamp: '2024-01-10T16:30:00Z',
    content: {
      id: 'preregistration-6',
      type: 'funding_request',
      status: 'OPEN',
      title: 'Microplastic Impact on Deep-Sea Ecosystems',
      abstract:
        'Studying microplastic accumulation in deep-sea biodiversity using autonomous vehicles to map distribution and analyze marine life impact.',
      timestamp: '2024-01-10T16:30:00Z',
      topic: hubs.marineScience,
      amount: 65000,
      goalAmount: 150000,
      deadline: futureDate(35),
      slug: 'microplastic-impact-deep-sea',
      actor: users.davidKumar,
      image: 'https://images.unsplash.com/photo-1561016444-14f747499547?q=80&w=800',
      preregistered: true,
    },
    metrics: {
      votes: 83,
      comments: 28,
      reposts: 22,
      saves: 45,
    },
    contributors: [
      {
        profile: users.hundessaNemomssa,
        amount: 40000,
      },
      {
        profile: users.mariaGarcia,
        amount: 25000,
      },
    ],
  },
];
