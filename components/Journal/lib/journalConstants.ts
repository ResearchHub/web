import { StaticImageData } from 'next/image';
import MaulikDhandhaImage from 'public/images/editors/MaulikDhandha.jpeg';
import EmilioMerhebImage from 'public/images/editors/EmilioMerheb.jpeg';
import AttilaKarsiImage from 'public/images/editors/AttilaKarsi.jpeg';
import EinsteinAvatar from 'public/images/editors/EinsteinAvatar.png';

export interface Editor {
  name: string;
  role: string;
  bio: string;
  image: StaticImageData | string; // Allow string for placeholder
  authorId: string | null;
  socialLinks: {
    email: string;
    linkedin?: string;
    scholar?: string;
  };
}

export const editors: Editor[] = [
  {
    name: 'Maulik M. Dhandha, MD FAAD',
    role: 'Editor in Chief',
    bio: 'Dr. Maulik Dhandha completed his medical school and residency training in Dermatology at Saint Louis University. He practices general dermatology and is actively involved in clinical research. His work is focused on autoimmune and inflammatory skin conditions including Pemphigus Vulgaris, Psoriasis, Hidradenitis Suppurative, Atopic Dermatitis and others. His work has been published in highly reputable journals like - Journal of American Academy of Dermatology, American Journal of Dermatopathology, Autoimmunity, and British Journal of Dermatology.',
    image: MaulikDhandhaImage,
    authorId: '931964',
    socialLinks: {
      email: 'maulik.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/maulik-dhandha-1836a5227/',
      scholar: 'https://scholar.google.com/citations?user=M2JZCWMAAAAJ&hl=en',
    },
  },
  {
    name: 'Emilio Merheb, PhD',
    role: 'Associate Editor',
    bio: 'Dr. Emilio Merheb is an Instructor at the Diabetes, Obesity, and Metabolism Institute (DOMI) at the Icahn School of Medicine at Mount Sinai. His scientific and research expertise specializes in endocrinology, metabolism, neuroscience, biochemistry, oncology, and molecular biology. Dr. Merheb completed his doctoral training and post-doctoral fellowship at the Albert Einstein College of Medicine. His research on neurodegeneration, islet biology, and β-cell therapies appears in top journals like Cell Metabolism, PNAS, and eLife. Notably, His dedication to science resulted in the recipient of multiple awards, including the Julius Marmur Award.',
    image: EmilioMerhebImage,
    authorId: '1872316',
    socialLinks: {
      email: 'emilio.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/emilio-merheb-ph-d-29ba10154/',
      scholar: 'https://scholar.google.com/citations?user=MY7E-6QAAAAJ&hl=en',
    },
  },
  {
    name: 'Attila Karsi, PhD',
    role: 'Associate Editor',
    bio: 'Dr. Attila Karsi earned his MSc and PhD degrees from Auburn University and is a tenured professor in the College of Veterinary Medicine at Mississippi State University. His research focuses on bacterial pathogenesis, host-pathogen interactions, and vaccine development. He has published over 100 peer-reviewed articles in esteemed journals, including Nucleic Acids Research, Journal of Bacteriology, Frontiers in Microbiology, and PLOS One.',
    image: AttilaKarsiImage,
    authorId: '984218',
    socialLinks: {
      email: 'attila.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/attilakarsi/',
      scholar: 'https://scholar.google.com/citations?user=kkhhBZgAAAAJ&hl=en',
    },
  },
  {
    name: 'Interested in joining as an Editor?',
    role: 'Associate Editor',
    bio: "If you're interested in joining the Editorial Board, please apply here by emailing maulik.editor@researchhub.foundation. Relevant qualifications include a PhD, a strong publication record, and a passion for driving scientific progress through innovative peer review systems.",
    image: EinsteinAvatar,
    authorId: null, // No author ID for this placeholder
    socialLinks: {
      email: 'maulik.editor@researchhub.foundation',
    },
  },
];

// Define HUBS data
export const HUBS = [
  'Biochemistry',
  'Genetics',
  'Molecular Biology',
  'Cancer Research',
  'Molecular Medicine',
  'Structural Biology',
  'Biophysics',
  'Biotechnology',
  'Endocrinology',
  'Clinical Biochemistry',
  'Physiology',
  'Developmental Biology',
  'Immunology',
  'Virology',
  'Parasitology',
  'Microbiology',
  'Applied Microbiology and Biotechnology',
  'Cognitive Neuroscience',
  'Cellular and Molecular Neuroscience',
  'Sensory Systems',
  'Endocrine and Autonomic Systems',
  'Behavioral Neuroscience',
  'Neurology',
  'Developmental Neuroscience',
  'Biological Psychiatry',
  'Pharmaceutical Science',
  'Pharmacology',
  'Toxicology',
  'Drug Discovery',
];
