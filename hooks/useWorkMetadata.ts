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
  openBounties: number;
  totalBountyAmount: number;
  bountyComments: number;
  reviewComments: number;
  conversationComments: number;
  updateComments: number;
  handleCommentCreated: (commentType: CommentType, bountyAmount?: number) => void;
}

enum WorkMetadataActionType {
  SYNC_METADATA = 'SYNC_METADATA',
  CREATE_COMMENT = 'CREATE_COMMENT',
}

interface SyncMetadataAction {
  type: WorkMetadataActionType.SYNC_METADATA;
  payload: WorkMetadata & { updateCount?: number };
}

interface CreateCommentAction {
  type: WorkMetadataActionType.CREATE_COMMENT;
  payload: {
    commentType: CommentType;
    bountyAmount?: number;
  };
}

type WorkMetadataAction = SyncMetadataAction | CreateCommentAction;

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

function workMetadataReducer(
  state: WorkMetadataState,
  action: WorkMetadataAction
): WorkMetadataState {
  switch (action.type) {
    case WorkMetadataActionType.SYNC_METADATA: {
      const { updateCount, ...metadata } = action.payload;
      return createInitialState(metadata, updateCount ?? state.updateComments);
    }

    case WorkMetadataActionType.CREATE_COMMENT: {
      const { commentType, bountyAmount } = action.payload;

      switch (commentType) {
        case 'BOUNTY':
          if (bountyAmount !== undefined) {
            return {
              ...state,
              openBounties: state.openBounties + 1,
              totalBountyAmount: state.totalBountyAmount + bountyAmount,
              bountyComments: state.bountyComments + 1,
            };
          }
          return state;

        case 'REVIEW':
          return {
            ...state,
            reviewComments: state.reviewComments + 1,
          };

        case 'GENERIC_COMMENT':
        case 'ANSWER':
          return {
            ...state,
            conversationComments: state.conversationComments + 1,
          };

        case 'AUTHOR_UPDATE':
          return {
            ...state,
            updateComments: state.updateComments + 1,
          };

        default:
          return state;
      }
    }

    default:
      return state;
  }
}

export function useWorkMetadata(
  metadata: WorkMetadata,
  initialUpdateCount: number = 0
): UseWorkMetadataReturn {
  const [state, dispatch] = useReducer(
    workMetadataReducer,
    createInitialState(metadata, initialUpdateCount)
  );

  useEffect(() => {
    dispatch({
      type: WorkMetadataActionType.SYNC_METADATA,
      payload: { ...metadata, updateCount: initialUpdateCount },
    });
  }, [metadata, initialUpdateCount]);

  const handleCommentCreated = useCallback((commentType: CommentType, bountyAmount?: number) => {
    dispatch({
      type: WorkMetadataActionType.CREATE_COMMENT,
      payload: { commentType, bountyAmount },
    });
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

export type { WorkMetadataAction };
