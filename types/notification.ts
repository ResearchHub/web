import { User } from "./user"

export interface Notification {
    id: number
    isRead: boolean
    type: string
    actionUser: User
    recipient: User
    work?: {
      id: number;
      title: string;
    }
    body: any
    extra: any
    navigationUrl: string | null
    createdDate: Date
    readDate: Date | null
  }