'use client';

import { FileInput } from 'lucide-react';
import { useEffect } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useGrantTab, type GrantBannerTab } from '@/components/Funding/GrantPageContent';
import { WorkTabs } from './WorkTabs';
import { useWorkTab } from './WorkHeader/WorkTabContext';
import { RegisteredReportPizzaTracker } from './RegisteredReportPizzaTracker';
import { useRegisteredReportWork } from './RegisteredReportWorkContext';

function ReportOnlyTabs() {
  return (
    <Tabs
      tabs={[
        {
          id: 'report',
          label: (
            <div className="flex items-center">
              <FileInput className="h-4 w-4 mr-2" />
              <span>Report</span>
            </div>
          ),
        },
      ]}
      activeTab="report"
      onTabChange={() => {}}
      className="border-b-0"
    />
  );
}

function FundingOpportunityTabs() {
  const { activeTab, setActiveTab, activity } = useGrantTab();
  const tabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'proposals' as const, label: 'Proposals' },
    {
      id: 'activity' as const,
      label: (
        <div className="flex items-center">
          <span>Updates</span>
          {activity.count > 0 && (
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'activity'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activity.count}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as GrantBannerTab)}
      className="border-b-0"
    />
  );
}

export function RegisteredReportHeaderTabs() {
  const { active } = useRegisteredReportWork();
  const { setActiveTab } = useWorkTab();

  useEffect(() => {
    setActiveTab('paper');
  }, [active.stage, active.work.id, setActiveTab]);

  return (
    <div className="space-y-3">
      <RegisteredReportPizzaTracker />
      {active.stage === 'registered_report' ? (
        <ReportOnlyTabs />
      ) : active.stage === 'grant' ? (
        <FundingOpportunityTabs />
      ) : (
        <WorkTabs
          work={active.work}
          metadata={active.metadata}
          contentType="fund"
          onTabChange={setActiveTab}
          updatesCount={active.authorPosts.length}
          disableUrlUpdates
        />
      )}
    </div>
  );
}
