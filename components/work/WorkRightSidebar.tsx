'use client';

import { Work } from '@/types/work';
import {
  Eye,
  MessageSquare,
  Star,
  Tags,
  Link2,
  File,
  Scale,
  BarChart2,
  FileText,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import type { WorkMetadata } from '@/services/metadata.service';
import { useState } from 'react';

interface WorkRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const WorkRightSidebar = ({ work, metadata }: WorkRightSidebarProps) => {
  const metrics = metadata.metrics;
  const topics = metadata.topics || [];
  const [showAllTopics, setShowAllTopics] = useState(false);

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 5);
  const hasMoreTopics = topics.length > 5;

  // Debug logging
  console.log('WorkRightSidebar render:', { metadata, work, metrics, topics });

  return (
    <div className="p-4 space-y-8">
      {/* Metrics Section */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart2 className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Metrics</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Review Score</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{metrics.reviewScore || 0}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Comments</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{metrics.comments || 0}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Views</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{metrics.views || 0}</span>
          </div>
        </div>
      </section>

      {/* Topics Section */}
      {topics?.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Tags className="h-5 w-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Topics</h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {displayedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {topic.name}
                </div>
              ))}
            </div>
            {hasMoreTopics && (
              <button
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <span>{showAllTopics ? 'Show less' : 'Show all topics'}</span>
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${showAllTopics ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        </section>
      )}

      {/* DOI Section */}
      {work.doi && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Link2 className="h-5 w-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">DOI</h2>
          </div>
          <Link
            href={`https://doi.org/${work.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{work.doi}</span>
          </Link>
        </section>
      )}

      {/* License Section */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">License</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{work.license || 'Unknown License'}</span>
        </div>
      </section>

      {/* Other Formats Section */}
      {work.formats.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Other Formats</h2>
          </div>
          <div className="space-y-2">
            {work.formats.map((format, index) => (
              <Link
                key={index}
                href={format.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <File className="h-4 w-4" />
                <span>{format.type.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
