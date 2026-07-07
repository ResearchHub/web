'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { GrantTabProvider } from '@/components/Funding/GrantPageContent';
import { ProposalSidebar } from './ProposalSidebar';
import { WorkHeader, WorkTabProvider } from './WorkHeader';
import { RegisteredReportWorkResponse } from '@/types/registeredReport';
import { WorkMetadata } from '@/services/metadata.service';
import {
  RegisteredReportWorkProvider,
  useRegisteredReportWork,
} from './RegisteredReportWorkContext';
import { RegisteredReportHeaderTabs } from './RegisteredReportHeaderTabs';

interface RegisteredReportWorkShellProps {
  initialPayload: RegisteredReportWorkResponse;
  initialMetadata: WorkMetadata;
  initialReportContent?: string;
  children: ReactNode;
}

function RegisteredReportWorkFrame({ children }: { children: ReactNode }) {
  const { reportWork, reportMetadata, active, isSwitchingStage } = useRegisteredReportWork();
  const grantId =
    active.stage === 'grant' ? (active.work.note?.post?.grant?.id ?? undefined) : undefined;

  const layout = (
    <PageLayout
      topBanner={
        <WorkHeader
          work={reportWork}
          metadata={reportMetadata}
          contentType="post"
          tabs={<RegisteredReportHeaderTabs />}
        />
      }
      rightSidebar={<ProposalSidebar work={reportWork} metadata={reportMetadata} />}
    >
      <div className="relative">
        {children}
        {isSwitchingStage && (
          <div
            className="absolute inset-0 z-20 flex min-h-[220px] items-start justify-center rounded-lg bg-white/70 pt-16 backdrop-blur-[1px]"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
              <span>Loading</span>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );

  if (active.stage === 'grant') {
    return (
      <GrantTabProvider key={active.work.id} defaultTab="details" grantId={grantId}>
        {layout}
      </GrantTabProvider>
    );
  }

  return layout;
}

export function RegisteredReportWorkShell({
  initialPayload,
  initialMetadata,
  initialReportContent,
  children,
}: RegisteredReportWorkShellProps) {
  return (
    <RegisteredReportWorkProvider
      key={initialPayload.work.id}
      initialPayload={initialPayload}
      initialMetadata={initialMetadata}
      initialReportContent={initialReportContent}
    >
      <WorkTabProvider key={initialPayload.work.id}>
        <RegisteredReportWorkFrame>{children}</RegisteredReportWorkFrame>
      </WorkTabProvider>
    </RegisteredReportWorkProvider>
  );
}
