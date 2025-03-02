import { ApiClient } from './client';
import { ID } from '@/types/root';
import { BountyType } from '@/types/bounty';

interface BountyAwardPayload {
  content_type: 'rhcommentmodel';
  object_id: ID;
  amount: string;
}

interface BountyAward {
  commentId: ID;
  amount: number;
}

interface ContributeToBountyPayload {
  amount: number;
  item_content_type: string;
  item_object_id: ID;
  bounty_type: BountyType;
  expiration_date: string;
}

export class BountyService {
  private static readonly BASE_PATH = '/api';

  static async awardBounty(bountyId: ID, awards: BountyAward[]): Promise<void> {
    // Filter out any awards with zero or negative amounts
    const validAwards = awards.filter((award) => award.amount > 0);

    if (validAwards.length === 0) {
      throw new Error('No valid awards found. All awards must have an amount greater than 0.');
    }

    const payload = validAwards.map((award) => ({
      content_type: 'rhcommentmodel' as const,
      object_id: award.commentId,
      amount: award.amount.toFixed(1), // Format as string with 1 decimal place
    }));

    const path = `${this.BASE_PATH}/bounty/${bountyId}/approve_bounty/`;
    await ApiClient.post<void>(path, payload);
  }

  static async contributeToBounty(
    objectId: ID,
    amount: number,
    objectContentType: string = 'rhcommentmodel',
    bountyType: BountyType,
    expirationDate: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Contribution amount must be greater than 0.');
    }

    const payload: ContributeToBountyPayload = {
      amount: amount,
      item_content_type: objectContentType,
      item_object_id: objectId,
      bounty_type: bountyType,
      expiration_date: expirationDate,
    };

    const path = `${this.BASE_PATH}/bounty/`;
    await ApiClient.post<void>(path, payload);
  }
}
