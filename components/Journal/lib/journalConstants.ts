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
    name: 'Ruslan Rust, PhD',
    role: 'Senior Editor',
    bio: '',
    image: '/people/ruslan.jpeg',
    authorId: '4945925',
    socialLinks: {
      email: 'ruslan.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/ruslan-rust/',
      scholar: 'https://scholar.google.com/citations?user=-Mc-aPAAAAAJ&hl=de',
    },
  },
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
    name: 'Selda Yildiz',
    role: 'Associate Editor',
    bio: '',
    image: '/people/selda.jpeg',
    authorId: '8116339',
    socialLinks: {
      email: 'selda.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/seldayildiz/',
      scholar: 'https://scholar.google.com/citations?user=QbTyK0AAAAAJ&hl=en',
    },
  },
  {
    name: 'Scott Nelson',
    role: 'Associate Editor',
    bio: '',
    image: '/people/scott.jpeg',
    authorId: '6328170',
    socialLinks: {
      email: 'scott.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/scott-nelson-8976897/',
      scholar: 'https://scholar.google.com/citations?user=MGmYWIYAAAAJ&hl=en',
    },
  },
  {
    name: 'Qingyu Luo',
    role: 'Associate Editor',
    bio: '',
    image: '/people/qingyu.jpeg',
    authorId: '6487201',
    socialLinks: {
      email: 'qingyu.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/qingyu-luo-md-phd/',
      scholar: 'https://scholar.google.com/citations?pli=1&authuser=1&user=rmULKhYAAAAJ',
    },
  },
  {
    name: 'Suramya Asthana',
    role: 'Assistant Editor',
    bio: '',
    image: '/people/suramya.jpeg',
    authorId: '9842880',
    socialLinks: {
      email: 'suramya.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/suramyaa/',
      scholar: 'https://scholar.google.com/citations?user=HWI44igAAAAJ&hl=en',
    },
  },
];
