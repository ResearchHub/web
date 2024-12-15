import { ApiClient } from './client'
import type { 
  NotificationListResponse, 
  NotificationCountResponse,
} from './types/notification.dto'

export class NotificationService {
  private static readonly BASE_PATH = '/api'

  static async getNotifications() {
    return ApiClient.get<NotificationListResponse>(
      `${this.BASE_PATH}/notification/`
    )
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
