import { ApiClient } from './client';
import {
  ReviewAvailability,
  ApiReviewAvailability,
  transformReviewAvailability,
} from '@/types/review';

export class ReviewService {
  static async getAvailability(): Promise<ReviewAvailability> {
    const response = await ApiClient.get<ApiReviewAvailability>('/api/review/availability/');
    return transformReviewAvailability(response);
  }
}
