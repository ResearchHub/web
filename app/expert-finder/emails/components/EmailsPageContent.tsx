'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { Tabs } from '@/components/ui/Tabs';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import { useOutreachCampaigns, useSavedTemplates } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import type { OutreachCampaign, SavedTemplate } from '@/types/expertFinder';
import { EXPERT_FINDER_LIST_PAGE_SIZE } from '@/app/expert-finder/lib/paginationParams';
import { CampaignsTable, CAMPAIGNS_TABLE_COLUMNS } from './CampaignsTable';
import { CampaignMobileCard } from './CampaignMobileCard';
import { DraftsTable, DRAFTS_TABLE_COLUMNS } from './DraftsTable';
import { DraftMobileCard } from './DraftMobileCard';

type EmailsTab = 'drafts' | 'campaigns';

function parseTab(value: string | null): EmailsTab {
  return value === 'campaigns' ? 'campaigns' : 'drafts';
}

export function EmailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mdAndUp } = useScreenSize();
  const activeTab = parseTab(searchParams.get('tab'));

  const [draftsPage, setDraftsPage] = useState(1);
  const [campaignsPage, setCampaignsPage] = useState(1);

  const draftsOffset = (draftsPage - 1) * EXPERT_FINDER_LIST_PAGE_SIZE;
  const campaignsOffset = (campaignsPage - 1) * EXPERT_FINDER_LIST_PAGE_SIZE;

  const [{ templates: drafts, pagination: draftsPagination, isLoading: draftsLoading, error: draftsError }] =
    useSavedTemplates({
      limit: EXPERT_FINDER_LIST_PAGE_SIZE,
      offset: draftsOffset,
    });

  const [
    {
      campaigns,
      pagination: campaignsPagination,
      isLoading: campaignsLoading,
      error: campaignsError,
    },
  ] = useOutreachCampaigns({
    limit: EXPERT_FINDER_LIST_PAGE_SIZE,
    offset: campaignsOffset,
  });

  const setTab = useCallback(
    (tabId: string) => {
      const tab = parseTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'drafts') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `/expert-finder/emails?${qs}` : '/expert-finder/emails', {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const tabs = useMemo(
    () => [
      { id: 'drafts', label: 'Drafts' },
      { id: 'campaigns', label: 'Campaigns' },
    ],
    []
  );

  const draftsTotalPages = Math.max(
    1,
    Math.ceil(draftsPagination.total / EXPERT_FINDER_LIST_PAGE_SIZE)
  );
  const campaignsTotalPages = Math.max(
    1,
    Math.ceil(campaignsPagination.total / EXPERT_FINDER_LIST_PAGE_SIZE)
  );

  const handleDraftClick = (draft: SavedTemplate) => {
    router.push(`/expert-finder/emails/${draft.id}`);
  };

  const handleCampaignClick = (campaign: OutreachCampaign) => {
    router.push(`/expert-finder/campaigns/${campaign.id}`);
  };

  function renderDrafts(): React.ReactNode {
    if (draftsLoading && drafts.length === 0) {
      return (
        <div className="p-4">
          {mdAndUp ? (
            <TableSkeleton
              columns={DRAFTS_TABLE_COLUMNS}
              rowCount={EXPERT_FINDER_LIST_PAGE_SIZE}
            />
          ) : (
            <ListCardSkeleton rowCount={EXPERT_FINDER_LIST_PAGE_SIZE} />
          )}
        </div>
      );
    }

    if (drafts.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600 mb-2">No drafts yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Create a draft with subject and body, then publish it as a campaign.
          </p>
          <Link href="/expert-finder/emails/new">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Create draft
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        {mdAndUp ? (
          <div className="overflow-x-auto">
            <DraftsTable drafts={drafts} onRowClick={handleDraftClick} />
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft, index) => (
              <DraftMobileCard
                key={draft.id ?? index}
                draft={draft}
                onClick={() => handleDraftClick(draft)}
                className="shadow-sm"
              />
            ))}
          </div>
        )}

        {draftsTotalPages > 1 && (
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {draftsPage} of {draftsTotalPages}
              {draftsPagination.total > 0 && (
                <span className="ml-2 text-gray-500">({draftsPagination.total} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PaginationButton
                label="Previous"
                onClick={() => setDraftsPage((p) => Math.max(1, p - 1))}
                disabled={draftsPage <= 1 || draftsLoading}
                isLoading={draftsLoading}
              />
              <PaginationButton
                label="Next"
                onClick={() => setDraftsPage((p) => Math.min(draftsTotalPages, p + 1))}
                disabled={draftsPage >= draftsTotalPages || draftsLoading}
                isLoading={draftsLoading}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  function renderCampaigns(): React.ReactNode {
    if (campaignsLoading && campaigns.length === 0) {
      return (
        <div className="p-4">
          {mdAndUp ? (
            <TableSkeleton
              columns={CAMPAIGNS_TABLE_COLUMNS}
              rowCount={EXPERT_FINDER_LIST_PAGE_SIZE}
            />
          ) : (
            <ListCardSkeleton rowCount={EXPERT_FINDER_LIST_PAGE_SIZE} />
          )}
        </div>
      );
    }

    if (campaigns.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600 mb-2">No campaigns yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Publish a draft to create a campaign you can send to experts.
          </p>
          <Button variant="default" size="sm" className="gap-2" onClick={() => setTab('drafts')}>
            Go to drafts
          </Button>
        </div>
      );
    }

    return (
      <>
        {mdAndUp ? (
          <div className="overflow-x-auto">
            <CampaignsTable campaigns={campaigns} onRowClick={handleCampaignClick} />
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <CampaignMobileCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign)}
                className="shadow-sm"
              />
            ))}
          </div>
        )}

        {campaignsTotalPages > 1 && (
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {campaignsPage} of {campaignsTotalPages}
              {campaignsPagination.total > 0 && (
                <span className="ml-2 text-gray-500">({campaignsPagination.total} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PaginationButton
                label="Previous"
                onClick={() => setCampaignsPage((p) => Math.max(1, p - 1))}
                disabled={campaignsPage <= 1 || campaignsLoading}
                isLoading={campaignsLoading}
              />
              <PaginationButton
                label="Next"
                onClick={() => setCampaignsPage((p) => Math.min(campaignsTotalPages, p + 1))}
                disabled={campaignsPage >= campaignsTotalPages || campaignsLoading}
                isLoading={campaignsLoading}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  const listError = activeTab === 'drafts' ? draftsError : campaignsError;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Breadcrumbs items={[{ label: 'Emails' }]} className="mb-2" />
          <p className="text-sm text-gray-600">
            Write drafts, publish campaigns, and track outreach performance.
          </p>
        </div>
        {activeTab === 'drafts' && drafts.length > 0 ? (
          <Link href="/expert-finder/emails/new">
            <Button variant="default" size="md" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Create draft
            </Button>
          </Link>
        ) : null}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setTab} className="mb-4" />

      {listError ? (
        <div className="mb-4">
          <Alert variant="error">{listError}</Alert>
        </div>
      ) : null}

      <div className="overflow-hidden">
        {activeTab === 'drafts' ? renderDrafts() : renderCampaigns()}
      </div>
    </div>
  );
}
