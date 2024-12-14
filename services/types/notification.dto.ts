import type { User } from '@/types/user'

export interface NotificationEntry {
  id: number
  read: boolean
  created_date: string
  notification_type: string
  target_user: User
  source_user?: User
  target_object?: any
}

export interface NotificationApiResponse {
  results: NotificationEntry[]
  count: number
  next: string | null
  previous: string | null
}