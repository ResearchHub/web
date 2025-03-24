'use client';

import { FC } from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface JournalSubmission {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  submissionDate: string;
  status: 'in-review' | 'published';
  reviewDueDate?: string;
  publishDate?: string;
  tags: string[];
}

interface JournalSubmissionCardProps {
  submission: JournalSubmission;
}

export const JournalSubmissionCard: FC<JournalSubmissionCardProps> = ({ submission }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusBadge = () => {
    switch (submission.status) {
      case 'in-review':
        return <Badge variant="warning">In Review</Badge>;
      case 'published':
        return <Badge variant="success">Published</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <Link
          href={`/journal/submission/${submission.id}`}
          className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          {submission.title}
        </Link>
        {getStatusBadge()}
      </div>

      <div className="mt-2 text-sm text-gray-700">
        <span>By </span>
        <span className="font-medium">
          {submission.authors.map((author, idx) => (
            <span key={idx}>
              {author}
              {idx < submission.authors.length - 1 ? ', ' : ''}
            </span>
          ))}
        </span>
      </div>

      <p className="mt-4 text-gray-600 line-clamp-3">{submission.abstract}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {submission.tags.map((tag) => (
          <Badge key={tag} variant="primary" size="sm" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Submitted: {formatDate(submission.submissionDate)}</span>
        </div>

        {submission.status === 'in-review' && submission.reviewDueDate && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Review due: {formatDate(submission.reviewDueDate)}</span>
          </div>
        )}

        {submission.status === 'published' && submission.publishDate && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Published: {formatDate(submission.publishDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
