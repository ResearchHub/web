import { GenericDocument, transformGenericDocument } from './document';
import { createTransformer } from './transformer';

export type PostType = 'QUESTION' | 'PREREGISTRATION';

export type Post = GenericDocument & {
  postType?: PostType;
  // note?: Note;
  srcUrl: string;
  renderableText?: string;
};

export const transformPost = createTransformer<any, Post>((raw) => ({
  ...transformGenericDocument(raw),
  postType: raw.document_type as PostType,
  srcUrl: raw.post_src,
  renderableText: raw.renderable_text,
}));
