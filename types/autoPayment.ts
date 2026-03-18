export type DistributionType =
  | 'EDITOR_PAYOUT'
  | 'EDITOR_COMPENSATION'
  | 'PREREGISTRATION_UPDATE_REWARD';

export type DistributedStatus = 'DISTRIBUTED' | 'PENDING' | 'FAILED';

export const DISTRIBUTION_TYPE_LABELS: Record<DistributionType, string> = {
  EDITOR_PAYOUT: 'Editor Pay',
  EDITOR_COMPENSATION: 'Editor Pay (Legacy)',
  PREREGISTRATION_UPDATE_REWARD: 'Author Update Reward',
};

interface AutoPaymentRecipientApi {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  author_profile: {
    id: number;
    profile_image: string | null;
  } | null;
}

export interface AutoPaymentApi {
  id: number;
  recipient: AutoPaymentRecipientApi | null;
  amount: string;
  distribution_type: DistributionType;
  distributed_status: DistributedStatus | null;
  created_date: string;
}

export interface AutoPaymentRecipient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authorProfile: {
    id: number;
    profileImage: string | null;
  } | null;
}

export interface AutoPayment {
  id: number;
  recipient: AutoPaymentRecipient | null;
  amount: string;
  distributionType: DistributionType;
  distributedStatus: DistributedStatus | null;
  createdDate: string;
}

export interface AutoPaymentsFilters {
  distributionType?: DistributionType;
  recipientId?: number;
  createdAfter?: Date | null;
  createdBefore?: Date | null;
}

export function transformAutoPayment(api: AutoPaymentApi): AutoPayment {
  return {
    id: api.id,
    recipient: api.recipient
      ? {
          id: api.recipient.id,
          firstName: api.recipient.first_name,
          lastName: api.recipient.last_name,
          email: api.recipient.email,
          authorProfile: api.recipient.author_profile
            ? {
                id: api.recipient.author_profile.id,
                profileImage: api.recipient.author_profile.profile_image,
              }
            : null,
        }
      : null,
    amount: api.amount,
    distributionType: api.distribution_type,
    distributedStatus: api.distributed_status,
    createdDate: api.created_date,
  };
}
