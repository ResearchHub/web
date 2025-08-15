import { stripHtml } from '@/utils/stringUtils';
import { ID } from './root';

export type UnifiedDocument = {
  createdBy?: any;
  document?: {
    id: ID;
    title?: string;
    slug?: string;
    body?: string;
    paperTitle?: string;
    abstract?: string;
    isRemoved?: boolean;
  };
  documentType: string;
  id: ID;
  isRemoved: boolean;
  authors: Array<any>;
};

// Types from contentType.ts
export type ContentType = {
  name:
    | 'paper'
    | 'post'
    | 'hypothesis'
    | 'comment'
    | 'document'
    | 'question'
    | 'bounty'
    | 'rsc_support';
  id: ID;
};

// Types from hub.ts
export type Hub = {
  id: ID;
  slug: string;
  name: string;
  description: string;
  relevancyScore: number;
  numDocs?: number;
  numComments?: number;
  isUsedForRep: boolean;
};

// Types for different contribution items
export type CommentContributionItem = {
  text?: any;
  unifiedDocument: UnifiedDocument;
  createdBy: any;
  createdDate: string;
  id: ID;
  content: any;
  postType: string;
  parent: null | CommentContributionItemParent;
};

export type CommentContributionItemParent = {
  content: any;
  id: ID;
  createdBy: any;
};

export type PaperContributionItem = {
  unifiedDocument: UnifiedDocument;
  title: string;
  slug: string;
  createdBy: any;
  createdDate: string;
  id: ID;
  abstract?: string;
};

export type HypothesisContributionItem = {
  unifiedDocument: UnifiedDocument;
  title: string;
  slug: string;
  createdBy: any;
  createdDate: string;
  id: ID;
};

export type BountyContributionItem = {
  unifiedDocument: UnifiedDocument;
  createdBy: any;
  createdDate: string;
  amount: number;
  content: any;
  id: ID;
  parent?: any;
  expirationDate?: string;
};

export type PostContributionItem = {
  unifiedDocument: UnifiedDocument;
  title: string;
  slug: string;
  createdBy: any;
  createdDate: string;
  id: ID;
};

export type Contribution = {
  raw: any;
  item:
    | PaperContributionItem
    | PostContributionItem
    | HypothesisContributionItem
    | CommentContributionItem
    | BountyContributionItem;
  createdDate: Date;
  contentType: ContentType;
  id?: ID;
  hubs: Array<Hub>;
};

const parseAuthorProfile = (raw: any): any => {
  if (typeof raw !== 'object') {
    return raw;
  }

  const url = `/author/${raw.id}`;

  const parsed = {
    id: raw.id,
    profileImage: raw.profile_image,
    firstName: raw.first_name,
    lastName: raw.last_name,
    url,
    isVerified: raw.is_verified,
  };

  return parsed;
};

const parseUnifiedDocument = (raw: any): UnifiedDocument => {
  if (typeof raw !== 'object') {
    return raw;
  }
  const parsed: UnifiedDocument = {
    id: raw.id,
    documentType: raw?.document_type?.toLowerCase(),
    document: { id: raw.id },
    isRemoved: raw.is_removed,
    authors: [],
    createdBy: raw.created_by,
  };

  if (raw.created_by) {
    parsed['createdBy'] = raw.created_by;
  }

  const unparsedInnerDoc = Array.isArray(raw.documents)
    ? raw.documents[0]
    : typeof raw.documents === 'object'
      ? raw.documents
      : {};

  parsed.document = {
    id: unparsedInnerDoc?.id,
    title: unparsedInnerDoc?.title,
    slug: unparsedInnerDoc?.slug,
  };

  if (parsed.documentType === 'discussion') {
    parsed.documentType = 'post';
  } else if (parsed.documentType === 'paper') {
    parsed.documentType = 'paper';
    parsed.document = {
      ...parsed.document,
      paperTitle: unparsedInnerDoc.paper_title,
      abstract: stripHtml(unparsedInnerDoc.abstract || ''),
    };
  }

  if (unparsedInnerDoc.renderable_text) {
    parsed.document['body'] = unparsedInnerDoc.renderable_text;
  }

  if (unparsedInnerDoc.authors) {
    parsed['authors'] = unparsedInnerDoc.authors.map(parseAuthorProfile);
  }

  return parsed;
};

const parseContentType = (raw: any): ContentType => {
  let contentTypeName;
  const inputName = raw.name || raw.model;
  if (inputName === 'rhcommentmodel') {
    contentTypeName = 'comment';
  } else if (inputName === 'paper') {
    contentTypeName = 'paper';
  } else if (inputName === 'researchhubpost') {
    contentTypeName = 'post';
  } else if (inputName === 'hypothesis') {
    contentTypeName = 'hypothesis';
  } else if (inputName === 'researchhubunifieddocument') {
    contentTypeName = 'document';
  } else if (inputName === 'purchase') {
    contentTypeName = 'rsc_support';
  } else if (inputName === 'bounty') {
    contentTypeName = 'bounty';
  } else {
    contentTypeName = inputName;
    console.error('Could not parse object with content_type=' + inputName);
  }

  return {
    id: raw.id,
    name: contentTypeName,
  };
};

const parseHub = (raw: any): Hub => {
  const parsed: Hub = {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    isUsedForRep: raw.is_used_for_rep || false,
    relevancyScore: raw.relevancy_score || 0,
    description: raw.description || '',
    numComments: raw.discussion_count || 0,
    numDocs: raw.paper_count || 0,
  };

  return parsed;
};

// Helper functions for parsing contribution items
const parseCommentContributionItem = (raw: any): CommentContributionItem => {
  return {
    content: raw.item.comment_content_json,
    createdBy: raw.created_by || raw.item.created_by,
    unifiedDocument: parseUnifiedDocument(raw.item.thread.content_object.unified_document),
    id: raw.item.id,
    createdDate: raw.created_date,
    postType: raw.item.thread?.thread_type,
    parent: raw.item.parent
      ? {
          id: raw.item.parent.id,
          content: raw.item.parent.comment_content_json,
          createdBy: raw.item.parent.created_by,
        }
      : null,
  };
};

const parseBountyContributionItem = (raw: any): BountyContributionItem => {
  raw.item.item.content_type = raw.item.content_type;

  return {
    createdBy: raw.created_by,
    unifiedDocument: parseUnifiedDocument(
      raw?.item?.item?.thread?.content_object?.unified_document
    ),
    id: raw.id,
    createdDate: raw.created_date,
    amount: raw.item.amount || raw.item,
    content: raw?.item?.item?.comment_content_json,
    ...(raw.item.bounty_parent && {
      parent: raw.item.bounty_parent,
    }),
    expirationDate: raw.item.expiration_date,
  };
};

const parsePaperContributionItem = (raw: any): PaperContributionItem => {
  return {
    id: raw.item.id,
    title: raw.item.title,
    slug: raw.item.slug,
    createdBy: raw.created_by || raw.uploaded_by || raw.item.created_by || raw.item.uploaded_by,
    unifiedDocument: parseUnifiedDocument(raw.item.unified_document),
    createdDate: raw.created_date,
    abstract: stripHtml(raw.item.abstract || ''),
  };
};

const parseHypothesisContributionItem = (raw: any): HypothesisContributionItem => {
  return {
    title: raw.item.title,
    slug: raw.item.slug,
    createdBy: raw.created_by,
    unifiedDocument: parseUnifiedDocument(raw.item.unified_document),
    id: raw.item.id,
    createdDate: raw.created_date,
    ...raw.item,
  };
};

const parsePostContributionItem = (raw: any): PostContributionItem => {
  return {
    title: raw.item.title,
    slug: raw.item.slug,
    createdBy: raw.created_by || raw.item.created_by,
    unifiedDocument: parseUnifiedDocument(raw.item.unified_document),
    id: raw.item.id,
    createdDate: raw.created_date,
  };
};

// Add this function
export const getContributionUrl = (entry: Contribution): string => {
  const { contentType } = entry;
  let { item } = entry;

  switch (contentType.name) {
    case 'comment':
      item = item as CommentContributionItem;
      return `/paper/${item.unifiedDocument.id}/conversation`;
    case 'rsc_support':
      item = item as BountyContributionItem;
      return `/paper/${item.unifiedDocument.id}`;
    case 'bounty':
      item = item as BountyContributionItem;
      return `/paper/${item.unifiedDocument.id}`;
    case 'paper':
      item = item as PaperContributionItem;
      return `/paper/${item.unifiedDocument.id}`;
    case 'hypothesis':
    case 'post':
    case 'question':
    default:
      item = item as PostContributionItem;
      return `/paper/${item.unifiedDocument.id}`;
  }
};

export const parseContribution = (raw: any): Contribution => {
  let mapped: any = {};
  try {
    mapped = {
      raw,
      createdDate: raw.created_date,
      contentType: parseContentType(raw.content_type),
      id: raw.id,
      hubs: (raw.hubs?.length ? raw.hubs : raw.item?.hubs?.length ? raw.item.hubs : []).map(
        (h: any) => parseHub(h)
      ),
    };

    if (raw.content_type.name === 'rhcommentmodel') {
      mapped['item'] = parseCommentContributionItem(raw);
    } else if (raw.content_type.name === 'paper') {
      mapped['item'] = parsePaperContributionItem(raw);
    } else if (
      raw.content_type.name === 'researchhubpost' ||
      raw.content_type.name === 'researchhubunifieddocument'
    ) {
      if (raw?.item?.unified_document?.document_type?.toLowerCase() === 'question') {
        mapped.contentType.name = 'question';
      }
      mapped['item'] = parsePostContributionItem(raw);
    } else if (raw.content_type.name === 'hypothesis') {
      mapped['item'] = parseHypothesisContributionItem(raw);
    } else if (raw.content_type.name === 'bounty') {
      mapped['item'] = parseBountyContributionItem(raw);
    } else {
      throw Error('Could not parse object with content_type=' + raw.content_type.name);
    }
  } catch (error) {
    console.warn('[Contribution] Failed to parse contribution', raw);
  }

  return mapped;
};
