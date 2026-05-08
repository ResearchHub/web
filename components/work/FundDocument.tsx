'use client';

import { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Comment } from '@/types/comment';
import { TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { AuthorPosts } from '@/components/Activity/AuthorPosts';
import { PostVideoCallout } from './components/PostVideoCallout';
import { useStorageKey } from '@/utils/storageKeys';
import { useUser } from '@/contexts/UserContext';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import { NewlyCreatedProposalModal } from '@/components/modals/NewlyCreatedProposalModal';
import { useWorkTab } from './WorkHeader/WorkTabContext';

interface FundDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  content?: string;
  authorPosts?: Comment[];
}

export const FundDocument = ({ work, metadata, content, authorPosts = [] }: FundDocumentProps) => {
  const { activeTab } = useWorkTab();
  const storageKey = useStorageKey('rh-comments');
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isProposalVideoModalOpen, setIsProposalVideoModalOpen] = useState(false);
  const [videoModalInitialStep, setVideoModalInitialStep] = useState<1 | 2>(1);
  // Whether the author has dismissed the rich "Show funders who you are" CTA.
  // Hydrated from localStorage in the effect below; the brief flash on first
  // paint is acceptable for a one-line CTA shown only to the author.
  const [isVideoCtaDismissed, setIsVideoCtaDismissed] = useState(false);

  // Two independent flags, intentionally separate keys:
  //   - cta-dismissed: hides the inline PostVideoCallout. Only set when the
  //     author explicitly clicks the X on the callout. A new post implicitly
  //     hides it via `authorPosts.length === 0` flipping false.
  //   - modal-seen: suppresses re-auto-opening the NewlyCreatedProposalModal
  //     on subsequent ?new=true visits. Set whenever the modal is closed.
  // Closing the modal must NOT touch the cta-dismissed flag — the callout
  // sticks around until the author posts or explicitly dismisses it.
  const videoCtaDismissKey = `proposal-video-cta-dismissed:${work.id}`;
  const videoModalSeenKey = `proposal-video-modal-seen:${work.id}`;

  // Check if current user is an author of the work
  const isCurrentUserAuthor = useMemo(() => {
    if (!user?.id) return false;
    return work.authors.some(
      (authorship) => authorship.authorProfile.id === user?.authorProfile?.id
    );
  }, [user?.id, work.authors]);

  useEffect(() => {
    try {
      setIsVideoCtaDismissed(!!localStorage.getItem(videoCtaDismissKey));
    } catch {
      // localStorage unavailable (private mode, etc.) — non-fatal.
    }
  }, [videoCtaDismissKey]);

  useEffect(() => {
    const newParam = searchParams.get('new');
    if (newParam === 'true') {
      if (!localStorage.getItem(videoModalSeenKey)) {
        setVideoModalInitialStep(1);
        setIsProposalVideoModalOpen(true);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, pathname, videoModalSeenKey]);

  const persistVideoCtaDismissal = () => {
    try {
      localStorage.setItem(videoCtaDismissKey, `dismissed:${new Date().toISOString()}`);
    } catch {
      // localStorage unavailable (private mode, etc.) — non-fatal.
    }
    setIsVideoCtaDismissed(true);
  };

  const handleCloseProposalVideoModal = () => {
    setIsProposalVideoModalOpen(false);
    // Mark the modal as seen so it doesn't auto-open on later ?new=true
    // visits — but DO NOT hide the callout. The callout only goes away when
    // the author posts or explicitly clicks its X.
    try {
      localStorage.setItem(videoModalSeenKey, `seen:${new Date().toISOString()}`);
    } catch {
      // localStorage unavailable (private mode, etc.) — non-fatal.
    }
  };

  const handleShowVideoGuide = () => {
    setVideoModalInitialStep(2);
    setIsProposalVideoModalOpen(true);
  };

  // Render tab content based on activeTab
  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return (
          <div className="mt-6">
            {metadata.fundraising && (
              <div className="mb-6">
                <FundraiseProgress
                  fundraise={{
                    id: metadata.fundraising.id,
                    status: metadata.fundraising.status,
                    amountRaised: {
                      rsc: metadata.fundraising.amountRaised.rsc,
                      usd: metadata.fundraising.amountRaised.usd,
                    },
                    goalAmount: {
                      rsc: metadata.fundraising.goalAmount.rsc,
                      usd: metadata.fundraising.goalAmount.usd,
                    },
                    endDate: metadata.fundraising.endDate,
                    contributors: {
                      numContributors: metadata.fundraising.contributors.topContributors.length,
                      topContributors: metadata.fundraising.contributors.topContributors,
                    },
                    createdDate: metadata.fundraising.createdDate || '',
                    updatedDate: metadata.fundraising.updatedDate || '',
                    goalCurrency: metadata.fundraising.goalCurrency || 'RSC',
                  }}
                  fundraiseTitle={work.title}
                  work={work}
                  onContribute={() => {}}
                  // Match the gray border used by AuthorPosts and PostBlockEditor
                  // on this page; the component's own primary-100 default is
                  // designed for use on backgrounds where the brand tint reads.
                  className="border-gray-200"
                />
              </div>
            )}
            {/*
              Render the rich callout *or* the AuthorPosts section, never both.
              The callout is the empty-state surface for authors who haven't
              posted yet and haven't dismissed the prompt; once they post or
              dismiss, the AuthorPosts section takes over with the same
              "+ New post" affordance in its header.
            */}
            {isCurrentUserAuthor && !isVideoCtaDismissed && authorPosts.length === 0 ? (
              <PostVideoCallout
                proposalTitle={work.title}
                onShowGuide={handleShowVideoGuide}
                onDismiss={persistVideoCtaDismissal}
              />
            ) : (
              <AuthorPosts
                posts={authorPosts}
                documentId={work.id}
                contentType={work.contentType}
                documentAuthors={work.authors}
              />
            )}
            {work.previewContent ? (
              <PostBlockEditor content={work.previewContent} />
            ) : content ? (
              <div
                className="prose max-w-none bg-white rounded-lg shadow-sm border p-6 mb-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-gray-500">No content available</p>
            )}
          </div>
        );
      case 'updates':
        return (
          <div className="space-y-6" key="updates-tab">
            <CommentFeed
              documentId={work.id}
              unifiedDocumentId={work.unifiedDocumentId || null}
              contentType={work.contentType}
              commentType="AUTHOR_UPDATE"
              key={`update-feed-${work.id}`}
              hideEditor={!isCurrentUserAuthor}
              workAuthors={work.authors}
              editorProps={{
                placeholder: 'Write an update...',
                commentType: 'AUTHOR_UPDATE',
                storageKey: `${storageKey}-update-feed-${work.id}`,
              }}
              work={work}
            />
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-6" key="reviews-tab">
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="REVIEW"
              key={`review-feed-${work.id}`}
              workAuthors={work.authors}
              belowEditor={<ReviewStatusBanner bounties={metadata.bounties || []} />}
              editorProps={{
                placeholder: 'Write your review...',
                initialRating: 0,
                commentType: 'REVIEW',
                storageKey: `${storageKey}-review-feed-${work.id}`,
              }}
              work={work}
            />
          </div>
        );
      case 'bounties':
        return (
          <div className="space-y-6" key="bounties-tab">
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="BOUNTY"
              renderCommentActions={false}
              hideEditor={true}
              key={`bounty-feed-${work.id}`}
              workAuthors={work.authors}
              editorProps={{
                storageKey: `${storageKey}-bounty-feed-${work.id}`,
              }}
              work={work}
            />
          </div>
        );
      case 'conversation':
        return (
          <div className="space-y-6" key="conversation-tab">
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`comment-feed-${work.id}`}
              workAuthors={work.authors}
              editorProps={{
                storageKey: `${storageKey}-comment-feed-${work.id}`,
              }}
              work={work}
            />
          </div>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    work,
    metadata,
    content,
    storageKey,
    isCurrentUserAuthor,
    authorPosts,
    isVideoCtaDismissed,
  ]);

  return (
    <div>
      {renderTabContent}
      <NewlyCreatedProposalModal
        isOpen={isProposalVideoModalOpen}
        onClose={handleCloseProposalVideoModal}
        initialStep={videoModalInitialStep}
        proposalTitle={work.title}
      />
    </div>
  );
};
