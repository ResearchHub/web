import { ApiClient } from './client';
import { ReviewAvailability, transformReviewAvailability } from '@/types/review';

export class ReviewService {
  static async getAvailability(): Promise<ReviewAvailability> {
    const response = await ApiClient.get<any>('/api/review/availability/');
    return transformReviewAvailability(response);
  }
}
