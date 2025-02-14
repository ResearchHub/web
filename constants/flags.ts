import { FlagReasonKey } from '@/types/work';

export const FLAG_REASON_METADATA: Record<FlagReasonKey, { label: string; description: string }> = {
  SPAM: {
    label: 'Spam',
    description: 'Exists only to promote a product or service',
  },
  COPYRIGHT: {
    label: 'Copyright Infringement',
    description: 'Cannot be publicly shared due to licensing. Likely behind a paywall',
  },
  LOW_QUALITY: {
    label: 'Low Quality',
    description: 'Quality is unreasonably low, lacks scientific rigor or contains glaring issues',
  },
  NOT_CONSTRUCTIVE: {
    label: 'Not Constructive',
    description:
      'Does not move the conversation forward productively or re-iterates existing knowledge. e.g. "Thanks", "I agree", "+1"',
  },
  PLAGIARISM: {
    label: 'Plagiarism',
    description: 'Copied work or ideas of others without citation',
  },
  ABUSIVE_OR_RUDE: {
    label: 'Rude or Abusive',
    description: 'Aims to offend; not respectful of community members',
  },
} as const;

// Helper function to get flag options for the modal
export const getFlagOptions = () => {
  return Object.entries(FLAG_REASON_METADATA).map(([key, metadata]) => ({
    value: key,
    label: metadata.label,
    description: metadata.description,
  }));
};
