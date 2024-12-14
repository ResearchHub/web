import { ApiClient } from './client'
import type { Notification } from './types'

export class NotificationService {
  private static readonly BASE_PATH = '/api'

  static async getNotifications() {
    return ApiClient.get<{ results: Notification[] }>(
      `${this.BASE_PATH}/notification/`
    )
  }

  static async markAsRead(notificationId: number) {
    return ApiClient.patch<Notification>(
      `${this.BASE_PATH}/notification/${notificationId}/`,
      { read: true }
    )
  }

  static async markAllAsRead(ids: number[]) {
    return ApiClient.patch<Notification[]>(
      `${this.BASE_PATH}/notification/`,
      { ids }
    )
  }
}
