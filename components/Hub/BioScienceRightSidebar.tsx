'use client';

import { Users, Shield, BookOpen, Microscope, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';

interface Moderator {
  id: number;
  name: string;
  image: string;
  title: string;
  affiliation: string;
}

const moderators: Moderator[] = [
  {
    id: 1,
    name: 'Dr. Robert Chen',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Editor-in-Chief',
    affiliation: 'Stanford University',
  },
  {
    id: 2,
    name: 'Dr. Maria Gonzalez',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b332c90c?w=150&h=150&fit=crop&crop=face',
    title: 'Associate Editor',
    affiliation: 'MIT',
  },
  {
    id: 3,
    name: 'Dr. James Wilson',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    title: 'Associate Editor',
    affiliation: 'Harvard Medical School',
  },
  {
    id: 4,
    name: 'Dr. Sarah Kim',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    title: 'Managing Editor',
    affiliation: 'Johns Hopkins University',
  },
];

export const BioScienceRightSidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Journal Info Card */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Journal Information</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Impact Factor</span>
            <span className="font-medium">9.2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">H-Index</span>
            <span className="font-medium">184</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Acceptance Rate</span>
            <span className="font-medium">22%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Review Time</span>
            <span className="font-medium">3-4 weeks</span>
          </div>
        </div>
        <Button className="w-full mt-4" size="sm">
          Submit Manuscript
        </Button>
      </Card>

      {/* Moderators Card */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Editorial Board</h3>
        </div>
        <div className="space-y-3">
          {moderators.map((moderator) => (
            <div key={moderator.id} className="flex items-center gap-3">
              <img
                src={moderator.image}
                alt={moderator.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{moderator.name}</p>
                <p className="text-xs text-gray-600 truncate">{moderator.title}</p>
                <p className="text-xs text-gray-500 truncate">{moderator.affiliation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">This Month</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">New Papers</span>
            <span className="text-sm font-medium text-gray-900">42</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Views</span>
            <span className="text-sm font-medium text-gray-900">128K</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Citations</span>
            <span className="text-sm font-medium text-gray-900">1,847</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">New Members</span>
            <span className="text-sm font-medium text-gray-900">156</span>
          </div>
        </div>
      </Card>

      {/* Journal Scope */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Microscope className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Journal Scope</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Gene Therapy', slug: 'gene-therapy' },
            { name: 'Climate Change', slug: 'climate-change' },
            { name: 'Marine Biology', slug: 'marine-biology' },
            { name: 'Neuroscience', slug: 'neuroscience' },
            { name: 'Biotechnology', slug: 'biotechnology' },
            { name: 'Ecology', slug: 'ecology' },
          ].map((topic, index) => (
            <TopicAndJournalBadge
              key={index}
              type="topic"
              name={topic.name}
              slug={topic.slug}
              size="sm"
            />
          ))}
        </div>
      </Card>
    </div>
  );
};
