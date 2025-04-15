import { ApiClient } from './client';

interface FeatureStatusResponse {
  clicked: boolean;
}

interface DismissFeaturePayload {
  user: number;
  feature: string;
}

export class SiteService {
  private static readonly BASE_PATH = '/api/new_feature_release';

  /**
   * Check if a user has dismissed a specific feature.
   * Corresponds to the GET request with route='clicked'.
   */
  static async getFeatureStatus(featureName: string): Promise<FeatureStatusResponse> {
    const lowerCaseFeatureName = featureName.toLowerCase();
    // The endpoint structure is /api/new_feature_release/{route}/?feature={featureName}
    return ApiClient.get<FeatureStatusResponse>(
      // Corrected URL structure
      `${this.BASE_PATH}/clicked/?feature=${lowerCaseFeatureName}`
    );
  }

  /**
   * Mark a feature as dismissed for a specific user.
   * Corresponds to the POST request.
   */
  static async dismissFeature(payload: DismissFeaturePayload): Promise<void> {
    // The payload requires 'user' (user ID) and 'feature' name.
    const apiPayload = {
      ...payload,
      feature: payload.feature.toLowerCase(),
    };
    // The API description suggests the endpoint might not need route/feature in the URL for POST,
    // but sends them in the body.
    await ApiClient.post<void>(`${this.BASE_PATH}/`, apiPayload);
  }
}
