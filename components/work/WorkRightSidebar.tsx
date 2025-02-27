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
  Download,
  Settings,
  X,
  User,
} from 'lucide-react';
import Link from 'next/link';
import type { WorkMetadata } from '@/services/metadata.service';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileLines } from '@fortawesome/pro-light-svg-icons';
import { handleDownload } from '@/utils/download';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '../ui/icons/ResearchCoinIcon';
import { HaveYouPublishedBanner } from '@/components/banners/HaveYouPublishedBanner';
import { PublishInJournalBanner } from '@/components/banners/PublishInJournalBanner';

interface WorkRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

const ClaimPaperBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100 mb-6 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Is this your paper?</h3>
      <ul className="space-y-4 mb-6">
        <li className="flex items-start gap-2 text-sm text-gray-700">
          <ResearchCoinIcon outlined size={20} color="#676767" />
          <span>Earn rewards for your paper</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <Settings
            className="h-5 w-5 text-primary-500 flex-shrink-0"
            style={{ color: '#676767' }}
          />
          <span>Be able to customize this page</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <User className="h-5 w-5 text-primary-500 flex-shrink-0" style={{ color: '#676767' }} />

          <span>Appear as author in comment section</span>
        </li>
      </ul>
      <Button className="w-full" variant="default" size="md">
        Claim your paper
      </Button>
    </div>
  );
};

export const WorkRightSidebar = ({ work, metadata }: WorkRightSidebarProps) => {
  const metrics = metadata.metrics;
  const topics = metadata.topics || [];
  const [showAllTopics, setShowAllTopics] = useState(false);

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 5);
  const hasMoreTopics = topics.length > 5;

  return (
    <div className="space-y-8">
      <HaveYouPublishedBanner />
      {/* <PublishInJournalBanner /> */}

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
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  {topic.name}
                </Link>
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
            <h2 className="text-base font-semibold text-gray-900">Other Formats</h2>
          </div>
          <div className="space-y-2">
            {work.formats.map((format, index) => (
              <div key={index} className="flex items-center justify-between">
                <Link
                  href={format.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {format.type === 'PDF' ? (
                    <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4 text-gray-500" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  <span>{format.type}</span>
                </Link>
                <button
                  onClick={() =>
                    handleDownload(format.url, `document.${format.type.toLowerCase()}`)
                  }
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
