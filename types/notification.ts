import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';
import { ContentType } from './work';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic } from './topic';
import { AuthorProfile } from './authorProfile';

export interface NotificationHub {
  name: string;
  slug: string;
}

export interface NotificationExtra {
  amount?: string;
  bounty_id?: string;
  bounty_type?: string;
  bounty_expiration_date?: string;
  hub_details?: string;
  user_hub_score?: string;
  rewardId?: string;
  rewardType?: 'REVIEW' | 'CONTRIBUTION' | 'DISCUSSION';
  hub?: NotificationHub;
  userHubScore?: string;
  rewardExpirationDate?: string;
}

export interface NotificationBodyElement {
  type: 'text' | 'link' | 'break';
  value: string;
  link?: string;
  extra?: string;
}

export interface Notification {
  id: number;
  actionUser: User;
  recipient: User;
  work?: {
    id: number;
    title: string;
    slug?: string;
  };
  type: string;
  body: NotificationBodyElement[];
  extra?: NotificationExtra;
  navigationUrl?: string;
  read: boolean;
  readDate: Date | null;
  createdDate: Date;
}

export type TransformedNotification = Notification & BaseTransformed;
export type TransformedNotificationExtra = NotificationExtra & BaseTransformed;
export type TransformedNotificationBodyElement = NotificationBodyElement & BaseTransformed;

// Helper function to transform notification extra without using createTransformer
const transformNotificationExtraRaw = (raw: any): NotificationExtra | undefined => {
  if (!raw) return undefined;

  let hub: NotificationHub | undefined = undefined;

  // Safely parse hub_details if available
  if (raw.hub_details) {
    try {
      const hubData = JSON.parse(raw.hub_details);
      hub = {
        name: hubData.name || '',
        slug: hubData.slug || '',
      };
    } catch (error) {
      console.error('Failed to parse hub_details', error);
    }
  }

  return {
    amount: raw.amount,
    bounty_id: raw.bounty_id,
    bounty_type: raw.bounty_type,
    bounty_expiration_date: raw.bounty_expiration_date,
    hub,
    user_hub_score: raw.user_hub_score,
    rewardId: raw.bounty_id,
    rewardType: raw.bounty_type,
    rewardExpirationDate: raw.bounty_expiration_date,
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

export const transformNotificationBody = (body: any): NotificationBodyElement[] | undefined => {
  if (!body) return undefined;

  if (Array.isArray(body)) {
    return body.map(transformNotificationBodyElement);
  }

  return [];
};

// Helper function to transform work without using createTransformer
const transformWorkRaw = (raw: any): { id: number; title: string; slug?: string } | undefined => {
  if (!raw) return undefined;

  // Direct extraction when raw is already a unified_document
  if (raw.documents) {
    // Handle array of documents
    if (Array.isArray(raw.documents)) {
      const firstDoc = raw.documents[0];
      if (!firstDoc) return undefined;
      return {
        id: firstDoc.id,
        title: firstDoc.title || firstDoc.paper_title || '',
        slug: firstDoc.slug,
      };
    }
    // Handle single document object
    else {
      return {
        id: raw.documents.id,
        title: raw.documents.title || raw.documents.paper_title || '',
        slug: raw.documents.slug,
      };
    }
  }

  // Handle case where raw contains unified_document
  if (raw.unified_document) {
    return transformWorkRaw(raw.unified_document);
  }

  // Fallback for direct properties
  if (raw.id && (raw.title || raw.paper_title)) {
    return {
      id: raw.id,
      title: raw.title || raw.paper_title || '',
      slug: raw.slug,
    };
  }

  return undefined;
};

export const transformWork = (raw: any) => {
  const transformed = transformWorkRaw(raw);
  if (!transformed) return undefined;
  return createTransformer<any, { id: number; title: string; slug?: string }>(() => transformed)(
    raw
  );
};

export const transformNotification = createTransformer<any, Notification>((raw) => ({
  id: raw.id,
  actionUser: transformUser(raw.action_user),
  recipient: transformUser(raw.recipient),
  work: transformWork(raw),
  type: raw.notification_type || raw.type,
  body: Array.isArray(raw.body) ? transformNotificationBody(raw.body) || [] : [],
  extra: transformNotificationExtra(raw.extra),
  navigationUrl: raw.navigation_url || '',
  read: !!raw.read,
  readDate: raw.read_date ? new Date(raw.read_date) : null,
  createdDate: new Date(raw.created_date),
}));
