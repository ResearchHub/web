import { ApiClient } from './client';
import type {
  NotificationListResponse,
  NotificationCountResponse,
  TransformedNotificationCountResponse,
} from './types/notification.dto';
import {
  transformNotificationListResponse,
  transformNotificationCountResponse,
} from './types/notification.dto';

export class NotificationService {
  private static readonly BASE_PATH = '/api';

  static async getNotifications(): Promise<NotificationListResponse> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/notification/`);
    return transformNotificationListResponse(response);
  }

  static async getNotificationsByUrl(url: string): Promise<NotificationListResponse> {
    const urlObject = new URL(url);
    const response = await ApiClient.get<any>(urlObject.pathname + urlObject.search);
    return transformNotificationListResponse(response);
  }

  static async getUnreadCount(): Promise<TransformedNotificationCountResponse> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/notification/unread_count/`);
    return transformNotificationCountResponse(response);
  }

  static async markAllAsRead() {
    return ApiClient.patch(`${this.BASE_PATH}/notification/mark_read/`);
  }
}
