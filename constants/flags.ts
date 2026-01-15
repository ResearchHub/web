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

// User flag reasons - used when moderators flag a user account
export type UserFlagReasonKey =
  | 'SPAM_ACCOUNT'
  | 'FAKE_IDENTITY'
  | 'HARASSMENT'
  | 'POLICY_VIOLATION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'OTHER';

export const USER_FLAG_REASON_METADATA: Record<
  UserFlagReasonKey,
  { label: string; description: string }
> = {
  SPAM_ACCOUNT: {
    label: 'Spam Account',
    description: 'Account exists primarily to promote products or services',
  },
  FAKE_IDENTITY: {
    label: 'Fake Identity',
    description: 'User is impersonating someone else or using false credentials',
  },
  HARASSMENT: {
    label: 'Harassment',
    description: 'User has engaged in harassment or abusive behavior toward others',
  },
  POLICY_VIOLATION: {
    label: 'Policy Violation',
    description: 'User has violated community guidelines or terms of service',
  },
  SUSPICIOUS_ACTIVITY: {
    label: 'Suspicious Activity',
    description: 'Unusual patterns suggesting automated or malicious behavior',
  },
  OTHER: {
    label: 'Other',
    description: 'Other reason not listed above',
  },
} as const;

// Helper function to get user flag options for the modal
export const getUserFlagOptions = () => {
  return Object.entries(USER_FLAG_REASON_METADATA).map(([key, metadata]) => ({
    value: key,
    label: metadata.label,
    description: metadata.description,
  }));
};
