import { stripHtml } from '@/utils/stringUtils';

export type ID = string | number | null | undefined;

export type Currency = 'RSC' | 'USD';

interface RawDocument {
  id: ID;
  title?: string;
  abstract?: string;
  slug?: string;
  authors?: Array<any>;
  [key: string]: any;
}

export interface RawUnifiedDocument {
  id: ID;
  documents: RawDocument | RawDocument[];
  document_type: string;
  [key: string]: any;
}

export interface TransformedDocument {
  id: ID;
  title?: string;
  abstract?: string;
  slug?: string;
  authors?: Array<any>;
  [key: string]: any;
}

export interface UnifiedDocument {
  id: ID;
  document: TransformedDocument;
  documentType: string;
  raw: RawUnifiedDocument | null;
}

/**
 * Transform a unified document from API format to our application format
 * Handles the case where documents can be either an array or direct object
 *
 * @param raw The raw unified document data from the API
 * @returns Transformed unified document with consistent structure
 */
export const transformUnifiedDocument = (
  raw: RawUnifiedDocument | null | undefined
): UnifiedDocument | null => {
  // Handle null or undefined raw data
  if (!raw) {
    return null;
  }

  // Extract the document data regardless of whether it's an array or object
  const documentData = Array.isArray(raw.documents) ? raw.documents[0] : raw.documents;

  return {
    id: raw.id,
    document: {
      id: documentData?.id,
      title: documentData?.title,
      abstract: stripHtml(documentData?.abstract || ''),
      slug: documentData?.slug,
      authors: documentData?.authors,
    },
    documentType: raw.document_type,
    raw,
  };
};
