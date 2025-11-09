import { useReducer, useEffect, useCallback } from 'react';
import { WorkMetadata } from '@/services/metadata.service';
import { CommentType } from '@/types/comment';
import { calculateOpenBountiesAmount } from '@/components/Bounty/lib/bountyUtil';

interface WorkMetadataState {
  openBounties: number;
  totalBountyAmount: number;
  bountyComments: number;
  reviewComments: number;
  conversationComments: number;
  updateComments: number;
}

interface UseWorkMetadataReturn {
  // Bounty-related state
  openBounties: number;
  totalBountyAmount: number;
  bountyComments: number;
  // Comment counters
  reviewComments: number;
  conversationComments: number;
  updateComments: number;
  // Callbacks to update when comments are created
  handleCommentCreated: (commentType: CommentType, bountyAmount?: number) => void;
}

// Action types
enum WorkMetadataActionType {
  SYNC_METADATA = 'SYNC_METADATA',
  SYNC_UPDATE_COUNT = 'SYNC_UPDATE_COUNT',
  CREATE_BOUNTY = 'CREATE_BOUNTY',
  CREATE_REVIEW = 'CREATE_REVIEW',
  CREATE_COMMENT = 'CREATE_COMMENT',
  CREATE_UPDATE = 'CREATE_UPDATE',
}

// Action interfaces
interface SyncMetadataAction {
  type: WorkMetadataActionType.SYNC_METADATA;
  payload: WorkMetadata;
}

interface CreateBountyAction {
  type: WorkMetadataActionType.CREATE_BOUNTY;
  payload: { bountyAmount: number };
}

interface CreateReviewAction {
  type: WorkMetadataActionType.CREATE_REVIEW;
}

interface CreateCommentAction {
  type: WorkMetadataActionType.CREATE_COMMENT;
}

interface CreateUpdateAction {
  type: WorkMetadataActionType.CREATE_UPDATE;
}

interface SyncUpdateCountAction {
  type: WorkMetadataActionType.SYNC_UPDATE_COUNT;
  payload: { count: number };
}

type WorkMetadataAction =
  | SyncMetadataAction
  | SyncUpdateCountAction
  | CreateBountyAction
  | CreateReviewAction
  | CreateCommentAction
  | CreateUpdateAction;

// Initial state factory
const createInitialState = (
  metadata: WorkMetadata,
  initialUpdateCount: number = 0
): WorkMetadataState => ({
  openBounties: metadata.openBounties || 0,
  totalBountyAmount: calculateOpenBountiesAmount(metadata.bounties || []),
  bountyComments: metadata.metrics.bountyComments || 0,
  reviewComments: metadata.metrics.reviewComments || 0,
  conversationComments: metadata.metrics.conversationComments || 0,
  updateComments: initialUpdateCount,
});

// Reducer function
function workMetadataReducer(
  state: WorkMetadataState,
  action: WorkMetadataAction
): WorkMetadataState {
  switch (action.type) {
    case WorkMetadataActionType.SYNC_METADATA:
      return {
        ...createInitialState(action.payload, state.updateComments),
        updateComments: state.updateComments, // Preserve update count
      };

    case WorkMetadataActionType.SYNC_UPDATE_COUNT:
      return {
        ...state,
        updateComments: action.payload.count,
      };

    case WorkMetadataActionType.CREATE_BOUNTY:
      return {
        ...state,
        openBounties: state.openBounties + 1,
        totalBountyAmount: state.totalBountyAmount + action.payload.bountyAmount,
        bountyComments: state.bountyComments + 1,
      };

    case WorkMetadataActionType.CREATE_REVIEW:
      return {
        ...state,
        reviewComments: state.reviewComments + 1,
      };

    case WorkMetadataActionType.CREATE_COMMENT:
      return {
        ...state,
        conversationComments: state.conversationComments + 1,
      };

    case WorkMetadataActionType.CREATE_UPDATE:
      return {
        ...state,
        updateComments: state.updateComments + 1,
      };

    default:
      return state;
  }
}

/**
 * Hook to manage work metadata counters with optimistic updates using reducer
 * @param metadata The initial metadata from server
 * @param initialUpdateCount Optional initial count for author updates (defaults to 0)
 * @returns Local state for counters and callback to update when comments are created
 */
export function useWorkMetadata(
  metadata: WorkMetadata,
  initialUpdateCount: number = 0
): UseWorkMetadataReturn {
  const [state, dispatch] = useReducer(
    workMetadataReducer,
    createInitialState(metadata, initialUpdateCount)
  );

  // Sync state when metadata prop changes (e.g., after router.refresh)
  useEffect(() => {
    dispatch({
      type: WorkMetadataActionType.SYNC_METADATA,
      payload: metadata,
    });
  }, [metadata]);

  // Sync update count when initialUpdateCount changes (e.g., when authorUpdates prop changes)
  useEffect(() => {
    dispatch({
      type: WorkMetadataActionType.SYNC_UPDATE_COUNT,
      payload: { count: initialUpdateCount },
    });
  }, [initialUpdateCount]);

  // Handle comment creation - update counters based on comment type
  const handleCommentCreated = useCallback((commentType: CommentType, bountyAmount?: number) => {
    switch (commentType) {
      case 'BOUNTY':
        if (bountyAmount !== undefined) {
          dispatch({
            type: WorkMetadataActionType.CREATE_BOUNTY,
            payload: { bountyAmount },
          });
        }
        break;

      case 'REVIEW':
        dispatch({
          type: WorkMetadataActionType.CREATE_REVIEW,
        });
        break;

      case 'GENERIC_COMMENT':
      case 'ANSWER':
        dispatch({
          type: WorkMetadataActionType.CREATE_COMMENT,
        });
        break;

      case 'AUTHOR_UPDATE':
        dispatch({
          type: WorkMetadataActionType.CREATE_UPDATE,
        });
        break;

      default:
        break;
    }
  }, []);

  return {
    openBounties: state.openBounties,
    totalBountyAmount: state.totalBountyAmount,
    bountyComments: state.bountyComments,
    reviewComments: state.reviewComments,
    conversationComments: state.conversationComments,
    updateComments: state.updateComments,
    handleCommentCreated,
  };
}

// Export WorkMetadataAction type for use in components
export type { WorkMetadataAction };
