'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';

interface WorkBountiesProps {
  workId: string;
}

export const WorkBounties = ({ workId }: WorkBountiesProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Active Bounties</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Bounty</Button>
      </div>
      <div className="text-center text-gray-500">No active bounties for this work.</div>

      <CreateBountyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workId={workId}
      />
    </div>
  );
};
