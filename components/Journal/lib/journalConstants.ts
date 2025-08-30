import { StaticImageData } from 'next/image';

export interface Editor {
  name: string;
  role: string;
  bio: string;
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
    name: 'Attila Karsi, PhD',
    role: 'Senior Editor',
    bio: 'Dr. Attila Karsi earned his MSc and PhD degrees from Auburn University and is a tenured professor in the College of Veterinary Medicine at Mississippi State University. His research focuses on bacterial pathogenesis, host-pathogen interactions, and vaccine development. He has published over 100 peer-reviewed articles in esteemed journals, including Nucleic Acids Research, Journal of Bacteriology, Frontiers in Microbiology, and PLOS One.',
    image: '/people/attila.jpeg',
    authorId: '984218',
    socialLinks: {
      email: 'attila.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/attilakarsi/',
      scholar: 'https://scholar.google.com/citations?user=kkhhBZgAAAAJ&hl=en',
    },
  },
  {
    name: 'Emilio Merheb, PhD',
    role: 'Senior Editor',
    bio: 'Dr. Emilio Merheb is an Instructor at the Diabetes, Obesity, and Metabolism Institute (DOMI) at the Icahn School of Medicine at Mount Sinai. His scientific and research expertise specializes in endocrinology, metabolism, neuroscience, biochemistry, oncology, and molecular biology. Dr. Merheb completed his doctoral training and post-doctoral fellowship at the Albert Einstein College of Medicine. His research on neurodegeneration, islet biology, and β-cell therapies appears in top journals like Cell Metabolism, PNAS, and eLife. Notably, His dedication to science resulted in the recipient of multiple awards, including the Julius Marmur Award.',
    image: '/people/emilio.jpeg',
    authorId: '1872316',
    socialLinks: {
      email: 'emilio.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/emilio-merheb-ph-d-29ba10154/',
      scholar: 'https://scholar.google.com/citations?user=MY7E-6QAAAAJ&hl=en',
    },
  },
  {
    name: 'Meet the Editor Team',
    role: 'Full Team',
    bio: 'Our editorial team consists of leading researchers and academics who are passionate about advancing scientific knowledge through innovative peer review systems. They bring expertise across diverse fields and are committed to maintaining the highest standards of scientific rigor and transparency.',
    image: '/EinsteinAvatar.png',
    authorId: '999998', // Placeholder ID for editorial team
    socialLinks: {
      website: 'https://www.researchhub.foundation/about',
    },
  },
];
