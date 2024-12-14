import { ApiClient } from './client'
import type { NotificationEntry, NotificationApiResponse } from './types/notification.dto'

export class NotificationService {
  private static readonly BASE_PATH = '/api'

  static async getNotifications() {
    return ApiClient.get<NotificationApiResponse>(
      `${this.BASE_PATH}/notification/`
    )
  }

  static async markAsRead(notificationId: number) {
    return ApiClient.patch<NotificationEntry>(
      `${this.BASE_PATH}/notification/${notificationId}/`,
      { read: true }
    )
  }

  static async markAllAsRead(ids: number[]) {
    return ApiClient.patch<NotificationEntry[]>(
      `${this.BASE_PATH}/notification/`,
      { ids }
    )
  }
}
