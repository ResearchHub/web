import { ID } from './root';
import { createTransformer, BaseTransformed } from './transformer';
import { transformPaper } from './paper';
import { transformNote } from './note';
import type { Paper } from './paper';
import type { Work } from './work';
import type { Note } from './note';

export type ListVisibility = 'PRIVATE' | 'PUBLIC' | 'SHARED';

export type PermissionLevel = 'VIEW' | 'EDIT' | 'ADMIN';

export interface ListPermission {
  id: ID;
  userId: ID;
  userName: string;
  permissionLevel: PermissionLevel;
  grantedAt: string;
  grantedBy: ID;
}

export interface ListDocument {
  id: ID;
  documentId: ID;
  documentType: 'paper' | 'post' | 'note';
  addedAt: string;
  addedBy: ID;
  order: number;
  // Document content for display
  content?: Paper | Work | Note;
  // Handle deleted documents
  isDeleted?: boolean;
  deletionDate?: string;
}

export interface UserList {
  id: ID;
  title: string;
  description?: string;
  visibility: ListVisibility;
  createdBy: ID;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  isEditable: boolean;
  isShared: boolean;
  sharedWith?: ID[];
  tags?: string[];
}

export interface UserListWithDocuments extends UserList {
  documents: ListDocument[];
  permissions: ListPermission[];
}

// API Response interfaces
export interface UserListApiResponse {
  id: ID;
  title: string;
  description: string | null;
  visibility: ListVisibility;
  created_by: ID;
  created_at: string;
  updated_at: string;
  item_count: number;
  is_editable: boolean;
  is_shared: boolean;
  shared_with: ID[] | null;
  tags: string[] | null;
}

export interface ListDocumentApiResponse {
  id: ID;
  document_id: ID;
  document_type: 'paper' | 'post' | 'note';
  added_at: string;
  added_by: ID;
  order: number;
  content?: any; // Raw content from API
  is_deleted?: boolean;
  deletion_date?: string;
}

export interface ListPermissionApiResponse {
  id: ID;
  user_id: ID;
  user_name: string;
  permission_level: PermissionLevel;
  granted_at: string;
  granted_by: ID;
}

export interface UserListListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserList[];
}

// Create/Update interfaces
export interface CreateUserListParams {
  title: string;
  description?: string;
  visibility: ListVisibility;
  tags?: string[];
}

export interface UpdateUserListParams {
  title?: string;
  description?: string;
  visibility?: ListVisibility;
  tags?: string[];
}

export interface AddDocumentToListParams {
  listId: ID;
  documentId: ID;
  documentType: 'paper' | 'post' | 'note';
}

export interface RemoveDocumentFromListParams {
  listId: ID;
  documentId: ID;
}

export interface AddPermissionParams {
  listId: ID;
  userId: ID;
  permissionLevel: PermissionLevel;
}

export interface RemovePermissionParams {
  listId: ID;
  userId: ID;
}

export interface ShareListParams {
  listId: ID;
  userIds: ID[];
  message?: string;
}

// Transformed types
export type TransformedUserList = UserList & BaseTransformed;
export type TransformedListDocument = ListDocument & BaseTransformed;
export type TransformedListPermission = ListPermission & BaseTransformed;

// Transformers
export const transformUserList = createTransformer<UserListApiResponse, UserList>((raw) => ({
  id: raw.id,
  title: raw.title,
  description: raw.description || undefined,
  visibility: raw.visibility,
  createdBy: raw.created_by,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  itemCount: raw.item_count,
  isEditable: raw.is_editable,
  isShared: raw.is_shared,
  sharedWith: raw.shared_with || undefined,
  tags: raw.tags || undefined,
}));

export const transformListDocument = createTransformer<ListDocumentApiResponse, ListDocument>(
  (raw) => ({
    id: raw.id,
    documentId: raw.document_id,
    documentType: raw.document_type,
    addedAt: raw.added_at,
    addedBy: raw.added_by,
    order: raw.order,
    content: raw.content ? transformContent(raw.content, raw.document_type) : undefined,
    isDeleted: raw.is_deleted || false,
    deletionDate: raw.deletion_date || undefined,
  })
);

export const transformListPermission = createTransformer<ListPermissionApiResponse, ListPermission>(
  (raw) => ({
    id: raw.id,
    userId: raw.user_id,
    userName: raw.user_name,
    permissionLevel: raw.permission_level,
    grantedAt: raw.granted_at,
    grantedBy: raw.granted_by,
  })
);

// Helper function to transform content based on type
const transformContent = (content: any, documentType: 'paper' | 'post' | 'note') => {
  switch (documentType) {
    case 'paper':
      return transformPaper(content);
    case 'post':
      return content; // Work type doesn't need transformation
    case 'note':
      return transformNote(content);
    default:
      return content;
  }
};

export const transformUserListWithDocuments = createTransformer<any, UserListWithDocuments>(
  (raw) => ({
    ...transformUserList(raw),
    documents: Array.isArray(raw.documents) ? raw.documents.map(transformListDocument) : [],
    permissions: Array.isArray(raw.permissions) ? raw.permissions.map(transformListPermission) : [],
  })
);
