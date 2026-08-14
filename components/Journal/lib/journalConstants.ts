import { StaticImageData } from 'next/image';

export interface Editor {
  name: string;
  role: string;
  bio: string;
  affiliation?: string;
  image: StaticImageData | string; // Allow string for placeholder
  authorId: string | null;
  socialLinks: {
    email?: string;
    linkedin?: string;
    scholar?: string;
    website?: string;
  };
}

export const editors: Editor[] = [
  {
    name: 'Ruslan Rust, PhD',
    role: 'Chief Editor',
    bio: '',
    affiliation: 'University of Southern California',
    image: '/people/ruslan.jpeg',
    authorId: '4945925',
    socialLinks: {
      email: 'ruslan.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/ruslan-rust/',
      scholar: 'https://scholar.google.com/citations?user=-Mc-aPAAAAAJ&hl=de',
    },
  },
  {
    name: 'Xavier Pereira-Hernández, PhD',
    role: 'Editor',
    bio: '',
    affiliation: 'Washington State University',
    image: '/people/xavier.jpeg',
    authorId: null,
    socialLinks: {
      email: 'xavier.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/xiph/',
      scholar: 'https://scholar.google.com/citations?user=cACsV1UAAAAJ&hl=en',
    },
  },
  {
    name: 'Scott Nelson, PhD',
    role: 'Associate Editor',
    bio: '',
    affiliation: 'Iowa State University',
    image: '/people/scott.jpeg',
    authorId: '6328170',
    socialLinks: {
      email: 'scott.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/scott-nelson-8976897/',
      scholar: 'https://scholar.google.com/citations?user=MGmYWIYAAAAJ&hl=en',
    },
  },
  {
    name: 'Suramya Asthana, PhD',
    role: 'Editor',
    bio: '',
    affiliation: 'Indian Institute of Science',
    image: '/people/suramya.jpeg',
    authorId: null,
    socialLinks: {
      email: 'suramya.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/suramyaa/',
      scholar: 'https://scholar.google.com/citations?user=HWI44igAAAAJ&hl=en',
    },
  },
  {
    name: 'Tibor V. Varga, PhD',
    role: 'Editor',
    bio: '',
    affiliation: 'University of Copenhagen',
    image: '/people/tibor.jpeg',
    authorId: null,
    socialLinks: {
      email: 'tibor.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/tiborvvarga/',
      scholar: 'https://scholar.google.com/citations?user=vfCZQvAAAAAJ&hl=en',
    },
  },
];
