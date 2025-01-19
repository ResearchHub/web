import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';

export interface NotificationHub {
  name: string;
  slug: string;
}

export interface NotificationExtra {
  amount?: string;
  rewardId?: string;
  rewardType?: 'REVIEW' | 'CONTRIBUTION' | 'DISCUSSION';
  hub?: NotificationHub;
  userHubScore?: string;
  rewardExpirationDate?: Date;
}

export interface NotificationBodyElement {
  type: 'text' | 'link' | 'break';
  value: string;
  link?: string;
  extra?: string;
}

export interface Notification {
  id: number;
  isRead: boolean;
  type: string;
  actionUser: User;
  recipient: User;
  work?: {
    id: number;
    title: string;
  };
  body: NotificationBodyElement[] | string;
  extra?: NotificationExtra;
  navigationUrl: string;
  createdDate: Date;
  readDate: Date | null;
}

export type TransformedNotification = Notification & BaseTransformed;
export type TransformedNotificationExtra = NotificationExtra & BaseTransformed;
export type TransformedNotificationBodyElement = NotificationBodyElement & BaseTransformed;

// Helper function to transform notification extra without using createTransformer
const transformNotificationExtraRaw = (raw: any): NotificationExtra | undefined => {
  if (!raw) return undefined;

  return {
    amount: raw.amount,
    rewardId: raw.bounty_id,
    rewardType: raw.bounty_type,
    hub: raw.hub_details ? JSON.parse(raw.hub_details) : undefined,
    userHubScore: raw.user_hub_score,
    rewardExpirationDate: raw.bounty_expiration_date
      ? new Date(raw.bounty_expiration_date)
      : undefined,
  };
};

export const transformNotificationExtra = (raw: any): TransformedNotificationExtra | undefined => {
  const transformed = transformNotificationExtraRaw(raw);
  if (!transformed) return undefined;
  return createTransformer<any, NotificationExtra>(() => transformed)(raw);
};

export const transformNotificationBodyElement = createTransformer<any, NotificationBodyElement>(
  (element) => ({
    type: element.type,
    value: element.value,
    link: element.link,
    extra: element.extra,
  })
);

export const transformNotificationBody = (
  body: any
): NotificationBodyElement[] | string | undefined => {
  if (!body) return undefined;

  if (Array.isArray(body)) {
    return body.map(transformNotificationBodyElement);
  }

  return body;
};

// Helper function to transform work without using createTransformer
const transformWorkRaw = (raw: any): { id: number; title: string } | undefined => {
  if (!raw?.documents) return undefined;

  return {
    id: raw.id,
    title: raw.documents.title || raw.documents.paper_title,
  };
};

export const transformWork = (raw: any) => {
  const transformed = transformWorkRaw(raw);
  if (!transformed) return undefined;
  return createTransformer<any, { id: number; title: string }>(() => transformed)(raw);
};

export const transformNotification = createTransformer<any, Notification>((raw) => ({
  id: raw.id,
  isRead: raw.read,
  type: raw.notification_type,
  actionUser: transformUser(raw.action_user),
  recipient: transformUser(raw.recipient),
  work: raw.unified_document ? transformWork(raw.unified_document) : undefined,
  body:
    raw.notification_type === 'RSC_SUPPORT_ON_DIS' ? transformNotificationBody(raw.body) : raw.body,
  extra: transformNotificationExtra(raw.extra),
  navigationUrl: raw.navigation_url,
  createdDate: new Date(raw.created_date),
  readDate: raw.read_date ? new Date(raw.read_date) : null,
}));
