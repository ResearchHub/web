import type { PoolCampaign } from '../lib/campaign';

export const SUBSTATION_CAMPAIGN: PoolCampaign = {
  slug: 'substation',
  fundLabel: 'The Substation Fund',
  unit: { singular: 'experiment', plural: 'experiments' },
  // The open RFP, where each proposal can be backed directly.
  fallbackUrl:
    '/grant/5081/request-for-proposals-electromagnetic-fields-and-soft-tissue-injury-susceptibility',
  environments: {
    production: {
      grantId: 24,
      allowedFundraiseIds: [352, 235, 233, 237, 244, 849],
    },
    // Staging preregistrations aren't attached to a grant yet. Seed one and
    // fill this in to exercise the pooled flow there.
    staging: null,
    development: {
      grantId: 1,
      allowedFundraiseIds: [4, 6],
    },
  },
};
