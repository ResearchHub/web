import { User } from "./user"
import { Document } from "./document"

export interface Notification {
    id: number
    isRead: boolean
    type: string
    actionUser: User
    recipient: User
    document?: Document
    body: any
    extra: any
    navigationUrl: string | null
    createdDate: Date
    readDate: Date | null
  }