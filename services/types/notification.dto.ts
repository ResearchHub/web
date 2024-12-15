export interface NotificationEntry {
  id: number
  read: boolean
  notification_type: string
  source_user?: {
    first_name: string
    last_name: string
  }
  created_date: string
}

export interface NotificationApiResponse {
  results: NotificationEntry[]
}

export interface NotificationCountResponse {
  count: number
}