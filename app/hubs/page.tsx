'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { hubs as hubsStore } from '@/store/hubStore';
import { HubCard } from '@/components/Hub/HubCard';
import { useState } from 'react';
import { Hub } from '@/types/hub';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';

export default function HubsPage() {
  // Convert hubs record to array
  const hubs: Hub[] = Object.values(hubsStore);
  const [followedIds, setFollowedIds] = useState<number[]>([]);

  const handleToggleFollow = (id: number, isCurrentlyFollowing: boolean) => {
    setFollowedIds((prev) => {
      const set = new Set(prev);
      if (isCurrentlyFollowing) {
        set.delete(id);
      } else {
        set.add(id);
      }
      return Array.from(set);
    });
  };

  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <PageLayout>
      <div className="pb-10">
        <div className="pt-4 pb-7">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 inline-flex items-center gap-2">
              <Icon name="topics" size={24} color="#4f46e5" />
              Explore Hubs
            </h1>
            <p className="text-gray-600 mt-1 max-w-2xl">
              Follow hubs (journals, organizations, research groups) to customize your ResearchHub
              feed and stay up to date with communities you care about.
            </p>
          </div>
        </div>

        <div className="mb-6 text-right">
          <Button
            variant="outlined"
            size="md"
            className="border-primary-600 text-primary-600 hover:bg-indigo-50"
          >
            <Plus size={16} className="mr-1.5" />
            Create Hub
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
              100 Rep
            </span>
          </Button>
        </div>

        <div className={gridClass}>
          {hubs.map((hub) => (
            <HubCard
              key={hub.id}
              hub={hub}
              isFollowing={followedIds.includes(hub.id)}
              onFollowToggle={handleToggleFollow}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
