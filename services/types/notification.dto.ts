import { User } from "@/types/user"
import { transformUserData } from "./user.dto"
import { Notification } from "@/types/notification"
import { Document } from "@/types/document"

export interface NotificationHub {
  name: string
  slug: string
}

export interface NotificationExtra {
  amount?: string
  rewardId?: string
  rewardType?: 'REVIEW' | 'CONTRIBUTION' | 'DISCUSSION'
  hub?: NotificationHub
  userHubScore?: string
  rewardExpirationDate?: Date
}

export interface NotificationListResponse {
  results: Notification[]
  count: number
  next: string | null
  previous: string | null
}

export interface NotificationCountResponse {
  count: number
}

export interface NotificationBodyElement {
  type: 'text' | 'link' | 'break'
  value: string
  link?: string
  extra?: string
}

export function transformNotificationExtra(raw: any): NotificationExtra | undefined {
  if (!raw) return undefined

  return {
    amount: raw.amount,
    rewardId: raw.bounty_id,
    rewardType: raw.bounty_type,
    hub: raw.hub_details ? JSON.parse(raw.hub_details) : undefined,
    userHubScore: raw.user_hub_score,
    rewardExpirationDate: raw.bounty_expiration_date ? new Date(raw.bounty_expiration_date) : undefined
  }
}

export function transformNotificationResponse(raw: any): NotificationListResponse {
  return {
    results: raw.results.map(transformNotification),
    count: raw.count,
    next: raw.next,
    previous: raw.previous,
  }
}

export function transformNotificationLegacyBodyProperty(body: any): NotificationBodyElement[] | undefined {
  if (!body || !Array.isArray(body)) {
    return undefined
  }

  return body.map((element: any) => ({
    type: element.type,
    value: element.value,
    link: element.link,
    extra: element.extra,
  }))
}

export function transformNotification(raw: any): Notification {
  return {
    id: raw.id,
    isRead: raw.read,
    type: raw.notification_type,
    actionUser: transformUserData(raw.action_user),
    recipient: transformUserData(raw.recipient),
    document: raw.unified_document ? transformDocument(raw.unified_document) : undefined,
    body: raw.notification_type === 'RSC_SUPPORT_ON_DIS' 
      ? transformNotificationLegacyBodyProperty(raw.body)
      : raw.body,
    extra: transformNotificationExtra(raw.extra),
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