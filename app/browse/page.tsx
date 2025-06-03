'use client';

import { useState, useMemo } from 'react';
import { Users, Grid3X3, Plus, Globe, List, PenLine } from 'lucide-react';
import { mockHubs, mockAuthors, BrowseHub, BrowseAuthor } from '@/store/browseStore';
import { HubCard, AuthorCard } from '@/components/Browse';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { Tooltip } from '@/components/ui/Tooltip';
import Link from 'next/link';

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'hubs' | 'authors'>('all');
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'all' | 'hubs' | 'authors');
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit clicked');
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'hubs', label: 'Hubs', icon: Grid3X3 },
    { id: 'authors', label: 'Authors', icon: Users },
  ];

  const tooltipContent = (
    <div className="flex items-center gap-2">
      <PenLine className="w-4 h-4" />
      <span>Edit your browse preferences</span>
    </div>
  );

  return (
    <PageLayout rightSidebar={false} maxWidth="wide">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-white -mx-4 tablet:!-mx-8 px-4 tablet:!px-8">
          <div className="max-w-6xl mx-auto py-8">
            <div className="text-center">
              {/* Globe Icon */}
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-indigo-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Discover Scientific Communities and Researchers
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Connect with leading researchers and join specialized hubs where breakthrough
                science happens.
              </p>

              {/* Create Hub CTA */}
              <div className="flex justify-center mb-6">
                <Link href="/hub/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Hub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto py-6">
          {/* Navigation Tabs with Edit */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
              <Tooltip content={tooltipContent} position="bottom" delay={150}>
                <div
                  onClick={() => executeAuthenticatedAction(handleEdit)}
                  role="button"
                  tabIndex={0}
                  aria-label="Edit browse preferences"
                  className="flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200"
                >
                  <PenLine className="w-5 h-5" />
                  <span className="hidden md:inline">Edit</span>
                </div>
              </Tooltip>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-8">
            {/* Authors Section */}
            {(activeTab === 'all' || activeTab === 'authors') && mockAuthors.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                    Leading Researchers
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
                  {mockAuthors.slice(0, 8).map((author) => (
                    <AuthorCard key={author.id} author={author} />
                  ))}
                </div>
                {mockAuthors.length > 8 && (
                  <div className="mt-6 text-center">
                    <Button variant="outlined">See all authors</Button>
                  </div>
                )}
              </section>
            )}

            {/* Hubs Section */}
            {(activeTab === 'all' || activeTab === 'hubs') && mockHubs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Grid3X3 className="h-5 w-5 mr-2 text-indigo-600" />
                    Hubs
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
                  {mockHubs.slice(0, 12).map((hub) => (
                    <HubCard key={hub.id} hub={hub} />
                  ))}
                </div>
                {mockHubs.length > 12 && (
                  <div className="mt-6 text-center">
                    <Button variant="outlined">See all hubs</Button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-3">Ready to Join the Scientific Community?</h3>
            <p className="text-indigo-100 mb-4 max-w-xl mx-auto">
              Connect with researchers, contribute to cutting-edge discussions, and help advance
              human knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/hub/create">
                <Button variant="outlined" className="bg-white text-indigo-600 hover:bg-gray-50">
                  Create a Hub
                </Button>
              </Link>
              <Button variant="outlined" className="bg-white text-indigo-600 hover:bg-gray-50">
                Join as Researcher
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
