import { ApiClient } from './client'
import type { 
  NotificationListResponse, 
  NotificationCountResponse,
} from './types/notification.dto'
import { transformNotificationResponse } from './types/notification.dto'

export class NotificationService {
  private static readonly BASE_PATH = '/api'

  static async getNotifications(): Promise<NotificationListResponse> {
    const response = await ApiClient.get<any>(
      `${this.BASE_PATH}/notification/`
    )
    return transformNotificationResponse(response)
  }

  static async getNotificationsByUrl(url: string): Promise<NotificationListResponse> {
    const urlObject = new URL(url)
    const response = await ApiClient.get<any>(urlObject.pathname + urlObject.search)
    return transformNotificationResponse(response)
  }

  static async getUnreadCount() {
    return ApiClient.get<NotificationCountResponse>(
      `${this.BASE_PATH}/notification/unread_count/`
    )
  }

  static async markAllAsRead() {
    return ApiClient.patch(
      `${this.BASE_PATH}/notification/mark_read/`
    )
  }
}
