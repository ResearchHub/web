'use client';

import { SearchHistoryTracker } from './SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { useRegisteredReportWork } from './RegisteredReportWorkContext';

export function RegisteredReportWorkTracking() {
  const { reportWork, reportMetadata } = useRegisteredReportWork();

  return (
    <>
      <SearchHistoryTracker work={reportWork} />
      <WorkDocumentTracker work={reportWork} metadata={reportMetadata} tab="paper" />
    </>
  );
}
