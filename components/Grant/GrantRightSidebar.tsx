'use client';

import { Grant } from '@/types/grant';
import {
  ArrowUp,
  MessageSquare,
  Users,
  Link2,
  Tag,
  Coins,
  Repeat2,
  Bookmark,
  Eye,
  Star,
  BarChart2,
} from 'lucide-react';

interface GrantRightSidebarProps {
  grant: Grant;
}

export function GrantRightSidebar({ grant }: GrantRightSidebarProps) {
  return (
    <div className="w-80 min-h-screen bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Metrics */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-gray-500" />
              Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-gray-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Views</span>
                </div>
                <span className="text-md font-medium">{grant.metrics.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-gray-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Repeat2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Reposts</span>
                </div>
                <span className="text-md font-medium">{grant.metrics.reposts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-gray-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Saves</span>
                </div>
                <span className="text-md font-medium">{grant.metrics.saves}</span>
              </div>
            </div>
          </div>

          {/* DOI */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-gray-500" />
              DOI
            </h3>
            <a
              href={`https://doi.org/${grant.doi}`}
              className="text-sm text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {grant.doi}
            </a>
          </div>

          {/* Applicants */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              Applicants
            </h3>
            <div className="space-y-3 mb-3">
              {grant.applicants.map(({ user }) => (
                <div key={user.id} className="flex items-center space-x-3">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white border border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium ring-2 ring-white border border-gray-200">
                      {user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{user.fullName}</div>
                    <div className="text-xs text-gray-500">
                      Applied {user.timestamp || '2d ago'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {grant.applicants.length > 3 && (
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                See all applicants →
              </button>
            )}
          </div>

          {/* Keywords */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {grant.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
