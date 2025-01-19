import { Notification, transformNotification } from "@/types/notification"
import { createTransformer, BaseTransformed } from "@/types/transformer"

export interface NotificationListResponse {
  results: Notification[]
  count: number
  next: string | null
  previous: string | null
}

export interface NotificationCountResponse {
  count: number
}

export type TransformedNotificationListResponse = NotificationListResponse & BaseTransformed
export type TransformedNotificationCountResponse = NotificationCountResponse & BaseTransformed

export const transformNotificationListResponse = createTransformer<any, NotificationListResponse>((raw) => ({
  results: raw.results.map((result: any) => transformNotification(result)),
  count: raw.count,
  next: raw.next,
  previous: raw.previous,
}))

export const transformNotificationCountResponse = createTransformer<any, NotificationCountResponse>((raw) => ({
  count: raw.count
}))