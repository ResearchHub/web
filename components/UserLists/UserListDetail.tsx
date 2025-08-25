'use client';

import { useState } from 'react';
import { useUserList } from '@/hooks/useUserLists';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { ShareListModal } from './ShareListModal';
import {
  ArrowLeft,
  Edit,
  Share,
  Eye,
  EyeOff,
  Users,
  Lock,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import type { ListVisibility } from '@/types/userList';

interface UserListDetailProps {
  listId: string;
}

export const UserListDetail = ({ listId }: UserListDetailProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { list, isLoading, error, updateList, removeDocumentFromList, reorderDocuments } =
    useUserList(listId);

  const getVisibilityIcon = () => {
    switch (list?.visibility) {
      case 'PUBLIC':
        return <Eye className="h-4 w-4" />;
      case 'SHARED':
        return <Users className="h-4 w-4" />;
      case 'PRIVATE':
        return <Lock className="h-4 w-4" />;
      default:
        return <EyeOff className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (list?.visibility) {
      case 'PUBLIC':
        return 'Public';
      case 'SHARED':
        return 'Shared';
      case 'PRIVATE':
        return 'Private';
      default:
        return 'Unknown';
    }
  };

  const getVisibilityColor = () => {
    switch (list?.visibility) {
      case 'PUBLIC':
        return 'bg-green-100 text-green-800';
      case 'SHARED':
        return 'bg-blue-100 text-blue-800';
      case 'PRIVATE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <div className="text-sm font-medium">{error.message || 'Failed to load list'}</div>
        </Alert>
      </div>
    );
  }

  if (isLoading || !list) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-96" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/lists">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{list.title}</h1>
            {list.description && <p className="text-gray-600 mb-4">{list.description}</p>}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{list.itemCount} items</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(list.updatedAt).toLocaleDateString()}</span>
              </div>
              <Badge className={cn('text-xs', getVisibilityColor())}>
                <div className="flex items-center gap-1">
                  {getVisibilityIcon()}
                  {getVisibilityLabel()}
                </div>
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {list.isEditable && (
              <>
                <Link href={`/lists/${list.id}/edit`}>
                  <Button variant="outlined">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outlined" onClick={() => setIsShareModalOpen(true)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {list.tags && list.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {list.tags.map((tag, index) => (
              <Badge key={index} variant="primary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Documents</h2>

        {list.documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-4">Start adding documents to your list</p>
            <Button variant="outlined">Add Items</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {list.documents.map((document, index) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-8">{index + 1}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {document.content?.title || `Document ${document.id}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(document.content as any)?.description ||
                          `Added ${new Date(document.addedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="text-xs">
                    {document.documentType}
                  </Badge>
                  {list.isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocumentFromList(document.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {list && (
        <ShareListModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          list={list}
        />
      )}
    </div>
  );
};
