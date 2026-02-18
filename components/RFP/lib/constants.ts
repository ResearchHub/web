import type { PublishingFormData } from '@/app/notebook/components/PublishingForm/schema';

export const RFP_DEADLINE = new Date('2029-12-31T23:59:59');
export const DEFAULT_RFP_TITLE = 'Untitled RFP';

export const RFP_FORM_DEFAULTS: Partial<PublishingFormData> = {
  articleType: 'grant',
  authors: [],
  contacts: [],
  topics: [],
  rewardFunders: false,
  nftSupply: '1000',
  isJournalEnabled: false,
  budget: '',
  coverImage: null,
  selectedNonprofit: null,
  departmentLabName: '',
  shortDescription: '',
  organization: '',
  applicationDeadline: RFP_DEADLINE,
};
