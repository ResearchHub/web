export const mockInterests = {
  journals: [
    {
      id: 'nature',
      name: 'Nature',
      type: 'journal',
      imageUrl: 'https://www.nature.com/static/images/logos/nature.png',
      description: 'International journal of science',
      followers: 1200000,
      verified: true,
    },
    {
      id: 'science',
      name: 'Science',
      type: 'journal',
      imageUrl: 'https://science.sciencemag.org/sites/default/files/images/Science_Logo.png',
      description: 'The world\'s leading outlet for scientific news',
      followers: 980000,
      verified: true,
    },
    {
      id: 'cell',
      name: 'Cell',
      type: 'journal',
      imageUrl: 'https://www.cell.com/pb-assets/images/cell.png',
      description: 'Leading journal in life sciences',
      followers: 750000,
      verified: true,
    },
    {
      id: 'plos_one',
      name: 'PLOS ONE',
      type: 'journal',
      description: 'Open access journal for all scientific disciplines',
      followers: 500000,
      verified: true,
    },
    {
      id: 'nejm',
      name: 'New England Journal of Medicine',
      type: 'journal',
      description: 'Leading medical journal',
      followers: 890000,
      verified: true,
    }
  ],
  people: [
    {
      id: 'researcher1',
      name: 'Dr. Sarah Chen',
      type: 'person',
      imageUrl: 'https://i.pravatar.cc/150?img=1',
      description: 'Neuroscientist at Stanford University',
      followers: 50000,
      verified: true,
    },
    {
      id: 'researcher2',
      name: 'Dr. James Wilson',
      type: 'person',
      imageUrl: 'https://i.pravatar.cc/150?img=2',
      description: 'Quantum Physics Researcher at MIT',
      followers: 45000,
      verified: true,
    },
    {
      id: 'researcher3',
      name: 'Dr. Maria Garcia',
      type: 'person',
      imageUrl: 'https://i.pravatar.cc/150?img=3',
      description: 'Climate Scientist at NASA',
      followers: 38000,
      verified: true,
    },
    {
      id: 'researcher4',
      name: 'Dr. David Lee',
      type: 'person',
      imageUrl: 'https://i.pravatar.cc/150?img=4',
      description: 'AI Researcher at DeepMind',
      followers: 62000,
      verified: true,
    },
    {
      id: 'researcher5',
      name: 'Dr. Emily Brown',
      type: 'person',
      imageUrl: 'https://i.pravatar.cc/150?img=5',
      description: 'Molecular Biologist at Harvard',
      followers: 41000,
      verified: true,
    }
  ],
  topics: [
    {
      id: 'ai',
      name: 'Artificial Intelligence',
      type: 'topic',
      description: 'Machine learning, neural networks, and AI applications',
      followers: 890000,
      verified: true,
    },
    {
      id: 'quantum',
      name: 'Quantum Computing',
      type: 'topic',
      description: 'Quantum mechanics and computing applications',
      followers: 450000,
      verified: true,
    },
    {
      id: 'neuroscience',
      name: 'Neuroscience',
      type: 'topic',
      description: 'Brain research and cognitive science',
      followers: 680000,
      verified: true,
    },
    {
      id: 'climate',
      name: 'Climate Science',
      type: 'topic',
      description: 'Climate change and environmental research',
      followers: 720000,
      verified: true,
    },
    {
      id: 'genetics',
      name: 'Genetics',
      type: 'topic',
      description: 'Genomics and genetic research',
      followers: 550000,
      verified: true,
    }
  ]
};

export function fetchInterests(type: 'journal' | 'person' | 'topic') {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (type) {
        case 'journal':
          resolve(mockInterests.journals);
          break;
        case 'person':
          resolve(mockInterests.people);
          break;
        case 'topic':
          resolve(mockInterests.topics);
          break;
        default:
          resolve([]);
      }
    }, 500);
  });
}
