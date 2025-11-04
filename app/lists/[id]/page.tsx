'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserList } from '@/hooks/useUserLists';
import { useRouter, useParams } from 'next/navigation';
import { FeedEntryItem } from '@/components/Feed/FeedEntryItem';
import { FeedEntry } from '@/types/feed';
import { FolderOpen, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from '@/components/modals/ListModal';
import { Input } from '@/components/ui/form/Input';
import { useState } from 'react';
import { ListService } from '@/services/list.service';
import { ListsRightSidebar } from '../components/ListsRightSidebar';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatItemCount } from '@/utils/listUtils';

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params?.id ? parseInt(params.id as string) : null;
  const { list, isLoading, error, fetchList, removeItem } = useUserList(listId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editListName, setEditListName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = () => {
    if (list) {
      setEditListName(list.name);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateList = async () => {
    if (!list || !editListName.trim()) return;
    setIsUpdating(true);
    try {
      await ListService.updateList(list.id, { name: editListName.trim() });
      await fetchList();
      setIsEditModalOpen(false);
      toast.success('List updated successfully');
    } catch (error) {
      console.error('Failed to update list:', error);
      toast.error(extractApiErrorMessage(error, 'Failed to update list'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteList = async () => {
    if (!list) return;
    setIsDeleting(true);
    try {
      await ListService.deleteList(list.id);
      toast.success('List deleted successfully');
      router.push('/lists');
    } catch (error) {
      console.error('Failed to delete list:', error);
      toast.error('Failed to delete list');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Convert list items to FeedEntry format for display
  const convertItemsToFeedEntries = (): FeedEntry[] => {
    if (!list?.items) return [];

    return list.items.map((item) => {
      const unifiedDocData = item.unified_document_data || {};
      const document = unifiedDocData.documents?.[0] || {};

      // Map document_type to FeedContentType
      const mapDocumentType = (docType?: string): string => {
        if (!docType) return 'PAPER';
        const upper = docType.toUpperCase();
        if (upper === 'PREREGISTRATION') return 'PREREGISTRATION';
        if (upper === 'POST' || upper === 'DISCUSSION') return 'POST';
        if (upper === 'PUBLISHED' || upper === 'PAPER') return 'PAPER';
        if (upper === 'GRANT') return 'GRANT';
        return upper;
      };

      const contentType = mapDocumentType(unifiedDocData.document_type || item.contentType);

      // Extract authors from the document
      const authors = ((document as any).authors || []).map((author: any) => ({
        id: author.id || 0,
        firstName: author.first_name || '',
        lastName: author.last_name || '',
        fullName: `${author.first_name || ''} ${author.last_name || ''}`.trim() || 'Unknown',
        profileImage: '',
        profileUrl: author.user ? `/author/${author.id}` : '',
        headline: '',
        isClaimed: !!author.user,
        isVerified: false,
        user: author.user ? { isVerified: false } : undefined,
      }));

      // Extract topics/hubs
      const topics = (unifiedDocData.hubs || []).map((hub: any) => ({
        id: hub.id || 0,
        name: hub.name || '',
        slug: hub.slug || '',
        imageUrl: hub.hub_image || null,
      }));

      // Get createdBy from first author or created_by
      const createdBy =
        authors[0] ||
        (unifiedDocData.created_by
          ? {
              id: unifiedDocData.created_by.id || 0,
              firstName: unifiedDocData.created_by.first_name || '',
              lastName: unifiedDocData.created_by.last_name || '',
              fullName:
                `${unifiedDocData.created_by.first_name || ''} ${unifiedDocData.created_by.last_name || ''}`.trim() ||
                'Unknown',
              profileImage: unifiedDocData.created_by.author_profile?.profile_image || '',
              profileUrl:
                unifiedDocData.created_by.author_profile?.profile_url ||
                `/author/${unifiedDocData.created_by.id}`,
              headline: '',
              isClaimed: false,
              isVerified: false,
              user: unifiedDocData.created_by.user ? { isVerified: false } : undefined,
            }
          : {
              id: 0,
              firstName: '',
              lastName: '',
              fullName: 'Unknown',
              profileImage: '',
              profileUrl: '/author/0',
              headline: '',
              isClaimed: false,
              isVerified: false,
            });

      // Extract fundraise data if it exists (for PREREGISTRATION)
      // Check multiple locations for fundraise data
      let fundraise: any = undefined;
      const fundraiseData =
        (unifiedDocData as any).fundraise ||
        (document as any).fundraise ||
        (document as any).note?.post?.fundraise ||
        (unifiedDocData as any).documents?.[0]?.fundraise;

      // Check if this is a PREREGISTRATION type (either from document_type or contentType)
      const isPreregistration =
        contentType === 'PREREGISTRATION' ||
        unifiedDocData.document_type === 'PREREGISTRATION' ||
        (document as any).type === 'PREREGISTRATION';

      if (isPreregistration && fundraiseData) {
        fundraise = {
          id: fundraiseData.id,
          status: fundraiseData.status || 'OPEN',
          goalCurrency: fundraiseData.goal_currency || fundraiseData.goalCurrency || 'USD',
          goalAmount: {
            usd: fundraiseData.goal_amount?.usd || fundraiseData.goalAmount?.usd || 0,
            rsc: fundraiseData.goal_amount?.rsc || fundraiseData.goalAmount?.rsc || 0,
          },
          amountRaised: {
            usd: fundraiseData.amount_raised?.usd || fundraiseData.amountRaised?.usd || 0,
            rsc: fundraiseData.amount_raised?.rsc || fundraiseData.amountRaised?.rsc || 0,
          },
          startDate: fundraiseData.start_date || fundraiseData.startDate,
          endDate: fundraiseData.end_date || fundraiseData.endDate,
          contributors: {
            numContributors:
              fundraiseData.contributors?.total || fundraiseData.contributors?.numContributors || 0,
            topContributors: (
              fundraiseData.contributors?.top ||
              fundraiseData.contributors?.topContributors ||
              []
            ).map((contributor: any) => ({
              id: contributor.id,
              authorProfile: {
                id: contributor.author_profile?.id || contributor.authorProfile?.id || 0,
                fullName:
                  `${contributor.author_profile?.first_name || contributor.authorProfile?.firstName || ''} ${contributor.author_profile?.last_name || contributor.authorProfile?.lastName || ''}`.trim() ||
                  'Unknown',
                firstName:
                  contributor.author_profile?.first_name ||
                  contributor.authorProfile?.firstName ||
                  '',
                lastName:
                  contributor.author_profile?.last_name ||
                  contributor.authorProfile?.lastName ||
                  '',
                profileImage:
                  contributor.author_profile?.profile_image ||
                  contributor.authorProfile?.profileImage ||
                  '',
                profileUrl:
                  contributor.author_profile?.profile_url ||
                  contributor.authorProfile?.profileUrl ||
                  `/author/${contributor.author_profile?.id || contributor.authorProfile?.id}`,
                headline: '',
                isClaimed: false,
                isVerified: false,
              },
              totalContribution:
                contributor.total_contribution || contributor.totalContribution || 0,
              contributions: contributor.contributions || [],
            })),
          },
          createdDate:
            fundraiseData.created_date || fundraiseData.createdDate || new Date().toISOString(),
          updatedDate:
            fundraiseData.updated_date || fundraiseData.updatedDate || new Date().toISOString(),
        };
      }

      // Build content based on type
      let content: any;

      if (contentType === 'PREREGISTRATION' || contentType === 'POST') {
        // POST or PREREGISTRATION content
        content = {
          id: (document as any).id || item.unified_document || 0,
          contentType: contentType,
          postType:
            (document as any).type ||
            (contentType === 'PREREGISTRATION' ? 'PREREGISTRATION' : 'POST'),
          createdDate: item.created_date || unifiedDocData.created_date || new Date().toISOString(),
          title: (document as any).title || 'Untitled',
          slug: (document as any).slug || '',
          textPreview: (document as any).renderable_text || (document as any).abstract || '',
          previewImage: (document as any).image_url || undefined,
          authors: authors,
          topics: topics,
          institution: (document as any).institution || undefined,
          createdBy: createdBy,
          unifiedDocumentId:
            (item.unified_document || unifiedDocData.unified_document_id)?.toString() || undefined,
          fundraise: fundraise,
          bounties: [],
          reviews: [],
        };
      } else if (contentType === 'GRANT') {
        // GRANT/RFP content
        // Try multiple possible locations for grant data
        const grantData =
          (unifiedDocData as any).grant ||
          (document as any).grant ||
          (document as any).note?.post?.grant ||
          {};

        // Extract amount - handle various formats and locations
        // Check document-level grant data, unified_document_data grant, and nested structures
        const grantAmountUsd =
          grantData.amount?.usd ||
          grantData.amount_usd ||
          grantData.grant_amount ||
          grantData.amount?.amount ||
          (document as any).grant_amount ||
          (document as any).note?.post?.grant?.amount?.usd ||
          (document as any).note?.post?.grant?.amount_usd ||
          (unifiedDocData as any).documents?.[0]?.grant_amount ||
          (unifiedDocData as any).documents?.[0]?.grant?.amount?.usd ||
          0;
        const grantAmountRsc =
          grantData.amount?.rsc ||
          grantData.amount_rsc ||
          (document as any).note?.post?.grant?.amount?.rsc ||
          (unifiedDocData as any).documents?.[0]?.grant?.amount?.rsc ||
          0;

        content = {
          id: (document as any).id || item.unified_document || 0,
          contentType: 'GRANT',
          createdDate: item.created_date || unifiedDocData.created_date || new Date().toISOString(),
          title: (document as any).title || 'Untitled',
          slug: (document as any).slug || '',
          textPreview:
            grantData.description ||
            grantData.grant_description ||
            (document as any).renderable_text ||
            (document as any).abstract ||
            '',
          previewImage: (document as any).image_url || undefined,
          authors: authors,
          topics: topics,
          createdBy: createdBy,
          unifiedDocumentId:
            (item.unified_document || unifiedDocData.unified_document_id)?.toString() || undefined,
          grant: {
            id: grantData.id || 0,
            amount: {
              usd: grantAmountUsd,
              rsc: grantAmountRsc,
              formatted: grantData.amount?.formatted || `$${grantAmountUsd.toLocaleString()}`,
            },
            organization: grantData.organization || grantData.grant_organization || '',
            description:
              grantData.description ||
              grantData.grant_description ||
              (document as any).renderable_text ||
              (document as any).abstract ||
              '',
            status: (grantData.status || 'CLOSED').toUpperCase() === 'OPEN' ? 'OPEN' : 'CLOSED',
            startDate:
              grantData.start_date || grantData.startDate || grantData.grant_start_date || '',
            endDate: grantData.end_date || grantData.endDate || grantData.grant_end_date || '',
            isExpired: grantData.is_expired || grantData.isExpired || false,
            isActive: grantData.is_active || grantData.isActive || false,
            currency: grantData.currency || grantData.grant_currency || 'USD',
            createdBy: grantData.created_by || createdBy,
            applicants:
              grantData.applicants ||
              grantData.applications?.map((app: any) => ({
                id: app.applicant?.id || app.id || 0,
                firstName: app.applicant?.first_name || app.first_name || '',
                lastName: app.applicant?.last_name || app.last_name || '',
                fullName:
                  `${app.applicant?.first_name || app.first_name || ''} ${app.applicant?.last_name || app.last_name || ''}`.trim() ||
                  'Unknown',
                profileImage: app.applicant?.profile_image || app.profile_image || '',
                profileUrl:
                  app.applicant?.profile_url ||
                  app.profile_url ||
                  `/author/${app.applicant?.id || app.id}`,
                headline: '',
                isClaimed: false,
                isVerified: false,
              })) ||
              [],
          },
          organization: grantData.organization || grantData.grant_organization || undefined,
          grantAmount:
            grantAmountUsd > 0
              ? {
                  amount: grantAmountUsd,
                  currency: grantData.currency || grantData.grant_currency || 'USD',
                  formatted: `$${grantAmountUsd.toLocaleString()}`,
                }
              : undefined,
          isExpired: grantData.is_expired || grantData.isExpired || false,
          bounties: [],
          reviews: [],
        };
      } else if (contentType === 'PAPER') {
        // PAPER content
        content = {
          id: (document as any).id || item.unified_document || 0,
          contentType: 'PAPER',
          createdDate: item.created_date || unifiedDocData.created_date || new Date().toISOString(),
          title: (document as any).title || 'Untitled',
          slug: (document as any).slug || '',
          textPreview: (document as any).renderable_text || (document as any).abstract || '',
          authors: authors,
          topics: topics,
          journal: (document as any).journal || {
            id: 0,
            name: '',
            slug: '',
            image: null,
            description: '',
          },
          createdBy: createdBy,
          unifiedDocumentId:
            (item.unified_document || unifiedDocData.unified_document_id)?.toString() || undefined,
        };
      } else {
        // Default to PAPER structure
        content = {
          id: (document as any).id || item.unified_document || 0,
          contentType: contentType,
          createdDate: item.created_date || unifiedDocData.created_date || new Date().toISOString(),
          title: (document as any).title || 'Untitled',
          slug: (document as any).slug || '',
          textPreview: (document as any).renderable_text || (document as any).abstract || '',
          authors: authors,
          topics: topics,
          journal: {
            id: 0,
            name: '',
            slug: '',
            image: null,
            description: '',
          },
          createdBy: createdBy,
          unifiedDocumentId:
            (item.unified_document || unifiedDocData.unified_document_id)?.toString() || undefined,
        };
      }

      // Extract metrics if available from unified document
      const unifiedDoc = (unifiedDocData as any).unified_document || {};
      const metrics =
        unifiedDoc.score !== undefined || unifiedDoc.reviews
          ? {
              votes: unifiedDoc.score || 0,
              comments: unifiedDoc.discussion_count || 0,
              saves: 0,
              reviewScore: unifiedDoc.reviews?.avg || 0,
            }
          : undefined;

      // Use document's created date for timestamp (when content was created, not when added to list)
      const documentCreatedDate =
        (document as any).created_date || unifiedDocData.created_date || item.created_date;

      return {
        id: item.id.toString(),
        contentType: contentType as any,
        createdDate: item.created_date || unifiedDocData.created_date,
        timestamp: documentCreatedDate,
        action: 'publish' as const,
        content: content,
        unifiedDocumentId: content.unifiedDocumentId || undefined,
        metrics: metrics,
      } as FeedEntry;
    });
  };

  if (isLoading) {
    return (
      <PageLayout rightSidebar={<ListsRightSidebar />}>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <span>/</span>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !list) {
    return (
      <PageLayout rightSidebar={<ListsRightSidebar />}>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <button
                    onClick={() => router.push('/lists')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Lists
                  </button>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">List</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">List</h1>
                <p className="text-gray-600">Loading list details...</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error || 'List not found'}
          </div>
        </div>
      </PageLayout>
    );
  }

  const feedEntries = convertItemsToFeedEntries();

  return (
    <PageLayout rightSidebar={<ListsRightSidebar />}>
      <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <button
                  onClick={() => router.push('/lists')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Lists
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate">{list.name}</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 truncate">{list.name}</h1>
              <p className="text-gray-600">{formatItemCount(list)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outlined" size="sm" onClick={handleEditClick} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleDeleteClick}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {feedEntries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">This list is empty</h3>
            <p className="text-gray-600">Start adding items to this list</p>
          </div>
        ) : (
          <div className="space-y-12">
            {feedEntries.map((entry, index) => (
              <div key={entry.id || index} className="relative group">
                <FeedEntryItem
                  entry={entry}
                  index={index}
                  hideActions={false}
                  disableCardLinks={false}
                />
                <div className="absolute top-16 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(Number(entry.id));
                    }}
                    className="h-8 w-8 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 shadow-md rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ListModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit List"
        subtitle="Update your list name"
      >
        <div className="space-y-6">
          <Input
            label="List Name"
            placeholder="Enter list name"
            value={editListName}
            onChange={(e) => setEditListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editListName.trim()) {
                handleUpdateList();
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleUpdateList}
              disabled={!editListName.trim() || isUpdating}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </ListModal>

      <ListModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete List"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Are you sure you want to delete "{list.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleDeleteList}
              disabled={isDeleting}
              isLoading={isDeleting}
              loadingText="Deleting..."
              className="bg-red-600 hover:bg-red-700"
            >
              Delete List
            </LoadingButton>
          </div>
        </div>
      </ListModal>
    </PageLayout>
  );
}
