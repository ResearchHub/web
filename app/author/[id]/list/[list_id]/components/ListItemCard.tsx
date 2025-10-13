'use client';

import { ID, RawUnifiedDocument, transformUnifiedDocument } from '@/types/root';
import { MouseEvent, useCallback, useState } from 'react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { toTitleCase } from '@/utils/stringUtils';
import { useRouter } from 'next/navigation';
import { useDeleteListItem } from '@/hooks/useListItem';
import { ContentSection, TitleSection } from '@/components/Feed/BaseFeedItem';
import { AuthorProfileError } from '@/app/author/[id]/page';
import { ContentTypeBadge, ContentTypeBadgeTypes } from '@/components/ui/ContentTypeBadge';
import { buildWorkUrl } from '@/utils/url';
import { ContentType } from '@/types/work';

export interface ListItemRaw {
  id: ID;
  unified_document: RawUnifiedDocument;
  document_type: string;
  created_date: string;
}

type ListItemCardProps = {
  listItem: ListItemRaw;
  authorId: ID;
  refreshList: () => Promise<void>;
};

export function ListItemCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header section - ContentTypeBadge and Delete button */}
      <div className="flex flex-row items-center justify-between mb-2">
        {/* ContentTypeBadge skeleton */}
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />

        {/* Delete button skeleton (always show since we don't know ownership during loading) */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Title section skeleton */}
      <div className="mb-3">
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Content section skeleton - multiple lines to simulate abstract */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function ListItemCard({ listItem, authorId, refreshList }: ListItemCardProps) {
  const unifiedDocument = transformUnifiedDocument(listItem.unified_document);

  if (!unifiedDocument) {
    return (
      <AuthorProfileError
        error={`transformUnifiedDocument failed:${listItem.unified_document}`}
        label="Failed to parse document"
      />
    );
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();
  const owner = user?.authorProfile?.id === authorId;
  const isMobile = useIsMobile();
  const deleteColor = isMobile ? 'text-red-400' : 'text-red-600 hover:text-red-800 hover:bg-red-50';
  const router = useRouter();
  const contentType = unifiedDocument.documentType.toLowerCase();
  const { deleteListItem: deleteListItemFn, isLoading: isDeletingListItem } = useDeleteListItem();

  const navToDocument = useCallback(
    (e: MouseEvent) => {
      const path = buildWorkUrl({
        id: unifiedDocument.document.id,
        contentType: contentType as ContentType,
        slug: unifiedDocument.document.slug,
      });

      if (!path) return;

      e.preventDefault();
      e.stopPropagation();

      router.push(path);
    },
    [unifiedDocument.document.id, contentType, unifiedDocument.document.slug, router]
  );

  const deleteListItem = useCallback(async () => {
    await deleteListItemFn({ id: listItem.id });

    refreshList();
  }, [listItem.id, refreshList, deleteListItemFn]);

  return (
    <Card>
      <div className="flex flex-row items-center justify-between mb-2">
        <ContentTypeBadge type={contentType as ContentTypeBadgeTypes} />
        {owner && (
          <div className="flex items-center space-x-2">
            <Tooltip content="Delete from list" delay={300}>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => executeAuthenticatedAction(() => setShowDeleteModal(true))}
                className={`p-1.5 ${deleteColor} rounded-md transition-colors h-7`}
                disabled={isDeletingListItem}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false);
              }}
              onConfirm={deleteListItem}
              title={`Delete ${toTitleCase(listItem.document_type)}`}
              message="Are your sure you want to delete this from your list?"
              confirmText="Yes, delete"
              cancelText="Cancel"
              confirmButtonClass="bg-red-600 hover:bg-red-700"
              cancelButtonClass="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            />
          </div>
        )}
      </div>
      <div onClick={navToDocument}>
        <TitleSection
          title={unifiedDocument.document.title || 'Untitled'}
          className="hover:text-blue-600 cursor-pointer"
        />
      </div>
      <ContentSection content={unifiedDocument.document.abstract || ''} />
    </Card>
  );
}
