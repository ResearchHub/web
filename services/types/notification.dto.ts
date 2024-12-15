import { User } from "@/types/user"
import { transformUserData } from "./user.dto"
import { Notification } from "@/types/notification"
import { Document } from "@/types/document"

export interface NotificationListResponse {
  results: Notification[]
  count: number
  next: string | null
  previous: string | null
}

export interface NotificationCountResponse {
  count: number
}

export function transformNotificationResponse(raw: any): NotificationListResponse {
  return {
    results: raw.results.map(transformNotification),
    count: raw.count,
    next: raw.next,
    previous: raw.previous,
  }
}

export function transformNotification(raw: any): Notification {
  return {
    id: raw.id,
    isRead: raw.read,
    type: raw.notification_type,
    actionUser: transformUserData(raw.action_user),
    recipient: transformUserData(raw.recipient),
    document: raw.unified_document ? transformDocument(raw.unified_document) : undefined,
    body: raw.body,
    extra: raw.extra,
    navigationUrl: raw.navigation_url,
    createdDate: new Date(raw.created_date),
    readDate: raw.read_date ? new Date(raw.read_date) : null,
  }
}

export function transformDocument(raw: any): Document | undefined {
  if (!raw?.documents) {
    return undefined
  }

  return {
    id: raw.documents.id,
    title: raw.documents.title || raw.documents.paper_title,
    slug: raw.documents.slug,
    type: raw.document_type || 'unknown'
  }
}