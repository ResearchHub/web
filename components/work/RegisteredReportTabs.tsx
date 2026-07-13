'use client';

import { FileInput } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';

export function RegisteredReportTabs() {
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
