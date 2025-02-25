import { ApiClient } from './client';
import { ID } from '@/types/root';

interface BountyAwardPayload {
  content_type: 'rhcommentmodel';
  object_id: ID;
  amount: string;
}

interface BountyAward {
  commentId: ID;
  amount: number;
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
}
