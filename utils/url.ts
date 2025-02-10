import { DocumentType } from '@/types/reaction';
import { ID } from '@/types/root';

/**
 * Converts a string to a URL-friendly slug
 * Example: "Hello World!" -> "hello-world"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Builds a work URL from an ID and optional slug
 */
export function buildWorkUrl(id: number | string, title?: string): string {
  const slug = title ? generateSlug(title) : '';
  return `/work/${id}${slug ? '/' + slug : ''}`;
}

/**
 * Builds a URL path for a work chain (document -> thread -> comment -> reply)
 * Example: "paper/123/discussion/456/comment/789/reply/101/"
 */
export function buildWorkChainUrl({
  documentType,
  documentId,
  threadId,
  commentId,
  replyId,
}: {
  documentType: DocumentType;
  documentId: number | string;
  threadId?: ID;
  commentId?: ID;
  replyId?: ID;
}): string {
  let urlPath = `${documentType}/${documentId}/`;

  if (threadId) {
    urlPath += `discussion/${threadId}/`;
    if (commentId) {
      urlPath += `comment/${commentId}/`;
      if (replyId) {
        urlPath += `reply/${replyId}/`;
      }
    }
  }

  return urlPath;
}
