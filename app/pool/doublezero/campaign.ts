import type { PoolCampaign } from '../lib/campaign';

export const DOUBLEZERO_CAMPAIGN: PoolCampaign = {
  slug: 'doublezero',
  fundLabel: 'The DoubleZero Science Fund',
  unit: { singular: 'proposal', plural: 'proposals' },
  // The open RFP, where each proposal can be backed directly.
  fallbackUrl:
    '/grant/32329/beyond-electromagnetic-communication-exploring-the-next-physics-of-connectivity',
  environments: {
    production: {
      grantId: 314,
      allowedFundraiseIds: [921, 982],
    },
    // This grant only exists in production. Seed a grant with preregistrations
    // on another backend and fill the matching entry in to exercise it there.
    staging: null,
    development: null,
  },
};
