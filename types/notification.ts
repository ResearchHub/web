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

export interface Document {
  id: number;
  title: string;
  paper_title?: string;
  slug: string;
  authors?: AuthorProfile[];
  topics?: Topic[];
  journal?: Journal;
  metrics?: ContentMetrics;
  workType?: 'paper' | 'preprint' | 'published';
}

export interface UnifiedDocument {
  documents: Document | Document[];
  document_type: ContentType;
}

export interface NotificationExtra {
  amount?: string;
  bounty_id?: string;
  bounty_type?: string;
  hub_details?: string;
  user_hub_score?: string;
  bounty_expiration_date?: string;
}

export interface NotificationBodyElement {
  type: 'text' | 'link' | 'break';
  value: string;
  link?: string;
  extra?: string;
}

export interface Notification {
  id: number;
  action_user: User;
  recipient: User;
  unified_document: UnifiedDocument;
  type: string;
  body: NotificationBodyElement[];
  extra: NotificationExtra;
  navigation_url: string | null;
  read: boolean;
  read_date: string;
  created_date: string;
}

export type TransformedNotification = Notification & BaseTransformed;
export type TransformedNotificationExtra = NotificationExtra & BaseTransformed;
export type TransformedNotificationBodyElement = NotificationBodyElement & BaseTransformed;

// Helper function to transform notification extra without using createTransformer
const transformNotificationExtraRaw = (raw: any): NotificationExtra | undefined => {
  if (!raw) return undefined;

  return {
    amount: raw.amount,
    bounty_id: raw.bounty_id,
    bounty_type: raw.bounty_type,
    hub_details: raw.hub_details,
    user_hub_score: raw.user_hub_score,
    bounty_expiration_date: raw.bounty_expiration_date,
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
export const transformWorkRaw = (raw: any): Document | undefined => {
  if (!raw || !raw.unified_document) return undefined;

  if (raw.unified_document.documents) {
    return Array.isArray(raw.unified_document.documents)
      ? raw.unified_document.documents[0]
      : raw.unified_document.documents;
  }

  return undefined;
};

export const transformWork = (raw: any): Document | undefined => {
  const transformed = transformWorkRaw(raw);
  if (!transformed) return undefined;
  return createTransformer<any, Document>(() => transformed)(raw);
};

export const transformNotification = createTransformer<any, Notification>((raw) => ({
  id: raw.id,
  action_user: transformUser(raw.action_user),
  recipient: transformUser(raw.recipient),
  unified_document: {
    documents: raw.unified_document.documents,
    document_type: (raw.unified_document.document_type?.toLowerCase() || 'unknown') as ContentType,
  },
  type: raw.notification_type || raw.type,
  body: transformNotificationBody(raw.body) || [],
  extra: transformNotificationExtra(raw.extra) || {},
  navigation_url: raw.navigation_url,
  read: raw.read,
  read_date: raw.read_date,
  created_date: raw.created_date,
}));
