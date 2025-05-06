import { Hub } from '@/types/hub';

export const hubs: Record<string, Hub> = {
  researchMethods: {
    name: 'Research Methods',
    slug: 'research-methods',
    id: 22,
    headline: 'Latest methodologies and best practices',
    description: 'A community focused on advancing research methodologies across disciplines.',
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    editors: [1, 3],
    followersCount: 1250,
  },
  neuroscience: {
    name: 'Neurology',
    slug: 'neurology',
    id: 101,
    headline: 'Exploring the human brain & nervous system',
    description:
      'Discuss the latest breakthroughs in neurology, neurodegenerative disease, and cognitive science.',
    imageUrl:
      'https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=400&q=80',
    editors: [2, 4],
    followersCount: 2280,
  },
  molecularBiology: {
    name: 'Forensic Medicine',
    slug: 'pathology-forensic-medicine',
    id: 102,
    headline: 'Decoding disease at the molecular level',
    description: 'Insights and discoveries in the field of pathology and forensic medicine.',
    imageUrl:
      'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=400&q=80',
    editors: [5],
    followersCount: 980,
  },
  environmentalScience: {
    name: 'Longevity Lab',
    slug: 'stanford-longevity-lab',
    id: 103,
    headline: 'Researching the science of long life',
    description: 'Official community for Stanford Longevity Lab sharing insights on healthy aging.',
    imageUrl: 'https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/block-s-right.png',
    verified: true,
    editors: [6, 7],
    followersCount: 3120,
  },
  medicalDevices: {
    name: 'Medical Devices',
    slug: 'medical-devices',
    id: 4,
    headline: 'Innovation in healthcare technology',
    description: 'Discussions on the latest advancements and regulations in medical devices.',
    imageUrl:
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=400&q=80',
    editors: [1],
    followersCount: 1500,
  },
  dataScience: {
    name: 'Data Science',
    slug: 'data-science',
    id: 5,
    headline: 'Unlocking insights from data',
    description: 'Machine learning, statistics, big data, and visualization techniques.',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    editors: [2, 5],
    followersCount: 2800,
  },
  quantumComputing: {
    name: 'Quantum Computing',
    slug: 'quantum-computing',
    id: 6,
    headline: 'The future of computation',
    description: 'Exploring qubits, entanglement, and the potential of quantum algorithms.',
    imageUrl:
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80',
    editors: [3],
    followersCount: 1100,
  },
  genetics: {
    name: 'Genetics',
    slug: 'genetics',
    id: 7,
    headline: 'Understanding the code of life',
    description: 'Gene editing, heredity, genomics, and personalized medicine.',
    imageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=400&q=80',
    editors: [4],
    followersCount: 1950,
  },
  artificialIntelligence: {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    id: 8,
    headline: 'Building intelligent systems',
    description: 'Deep learning, natural language processing, computer vision, and AI ethics.',
    imageUrl:
      'https://images.unsplash.com/photo-1599493347075-3049f1575b09?auto=format&fit=crop&w=400&q=80',
    editors: [1, 5],
    followersCount: 3500,
  },
  climateScience: {
    name: 'Climate Science',
    slug: 'climate-science',
    id: 9,
    headline: 'Addressing the global climate challenge',
    description: 'Modeling, impacts, mitigation, and adaptation strategies for climate change.',
    imageUrl:
      'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?auto=format&fit=crop&w=400&q=80',
    editors: [2],
    followersCount: 1600,
  },
  biology: {
    name: 'Biology',
    slug: 'biology',
    id: 10,
    headline: 'Exploring the diversity of life',
    description: 'From cellular processes to ecosystems, the study of living organisms.',
    imageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=400&q=80',
    editors: [3, 4],
    followersCount: 2100,
  },
};
