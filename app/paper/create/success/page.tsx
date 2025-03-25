'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Eye, Share2, MessageCircle, Award, Link, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SubmissionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paperTitle, setPaperTitle] = useState<string>('');
  const [paperId, setPaperId] = useState<string | null>(null);
  const [isJournal, setIsJournal] = useState<boolean>(false);

  useEffect(() => {
    const title = searchParams.get('paperTitle');
    const id = searchParams.get('paperId');
    const journalSubmission = searchParams.get('isJournal') === 'true';
    // Parameter to manually override which view to show
    const forceView = searchParams.get('forceView');

    if (title) {
      setPaperTitle(decodeURIComponent(title));
    }

    if (id) {
      setPaperId(id);
    }

    // If forceView is specified, use that instead of the actual submission type
    if (forceView === 'journal') {
      setIsJournal(true);
    } else if (forceView === 'regular') {
      setIsJournal(false);
    } else {
      setIsJournal(journalSubmission);
    }
  }, [searchParams]);

  const handleCopyLink = () => {
    if (paperId) {
      const url = `${window.location.origin}/paper/${paperId}`;
      navigator.clipboard.writeText(url).then(
        () => {
          toast.success('Paper URL copied to clipboard');
        },
        () => {
          toast.error('Failed to copy URL');
        }
      );
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center my-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <PageHeader title="Submission Successful!" className="mb-4" />

          {paperTitle && <h2 className="text-lg font-medium text-gray-800 mb-4">"{paperTitle}"</h2>}

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {isJournal
              ? 'Your research paper has been submitted to the ResearchHub Journal. It will go through peer review before publication.'
              : 'Your research paper has been successfully submitted to ResearchHub as a preprint and is now available on the platform.'}
          </p>

          <div className="flex items-center justify-center mt-8 mb-8">
            {paperId && (
              <Button onClick={() => router.push(`/paper/${paperId}`)} variant="default" size="lg">
                <Eye className="h-4 w-4 mr-2" />
                View Your Paper
              </Button>
            )}
          </div>

          {isJournal ? (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6 text-left">
                Journal Publication Process
              </h3>

              <div className="max-w-3xl mx-auto">
                <ol className="relative border-l border-gray-300">
                  <li className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center text-lg font-semibold text-gray-900">
                        Preprint available on ResearchHub
                      </h3>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-left text-gray-600">
                      <a href={`/paper/${paperId}`} className="text-indigo-600 hover:underline">
                        View your paper →
                      </a>
                    </p>
                  </li>

                  <li className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-amber-100">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Peer review evaluations
                      </h3>
                      <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                        10-14 days
                      </span>
                    </div>
                    <p className="text-left text-base text-gray-600 mt-2">
                      Expert reviewers evaluate your paper and provide feedback
                    </p>
                  </li>

                  <li className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-gray-200">
                      <span className="w-5 h-5 text-gray-500">3</span>
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Review quality check</h3>
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        1-7 days
                      </span>
                    </div>
                    <p className="text-left text-base text-gray-600 mt-2">
                      Editorial team ensures review quality and completeness
                    </p>
                  </li>

                  <li className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-gray-200">
                      <span className="w-5 h-5 text-gray-500">4</span>
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Publication decision</h3>
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        Waiting for reviews
                      </span>
                    </div>
                    <p className="text-left text-base text-gray-600 mt-2">
                      Reviewers may request changes. Please respond within 14 days to finalize
                      publication
                    </p>
                  </li>

                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 bg-gray-200">
                      <span className="w-5 h-5 text-gray-500">5</span>
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Paper published in ResearchHub Journal
                      </h3>
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        Final step
                      </span>
                    </div>
                    <p className="text-left text-base text-gray-600 mt-2">
                      Paper formally published
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-center text-xl font-medium text-gray-900 mb-6">What's Next?</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg flex flex-col h-full">
                  <div className="flex-grow">
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <MessageCircle className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 text-center">Leave a Comment</h4>
                    <p className="text-sm text-gray-600 mb-6 text-center">
                      Comments increase engagement and promote visibility on the platform.
                    </p>
                  </div>
                  <div className="mt-auto">
                    {paperId && (
                      <Button
                        onClick={() => router.push(`/paper/${paperId}`)}
                        variant="outlined"
                        className="w-full"
                        size="sm"
                      >
                        Comment on paper
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg flex flex-col h-full">
                  <div className="flex-grow">
                    <div className="flex justify-center mb-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 text-center">
                      Open a Peer Review Bounty
                    </h4>
                    <p className="text-sm text-gray-600 mb-6 text-center">
                      Create a ResearchCoin bounty to entice users to review your paper.
                    </p>
                  </div>
                  <div className="mt-auto">
                    {paperId && (
                      <Button
                        onClick={() => router.push(`/paper/${paperId}/bounties`)}
                        variant="outlined"
                        className="w-full"
                        size="sm"
                      >
                        Create bounty
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg flex flex-col h-full">
                  <div className="flex-grow">
                    <div className="flex justify-center mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Share2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 text-center">Share Paper</h4>
                    <p className="text-sm text-gray-600 mb-6 text-center">
                      Share your work with colleagues and the research community to increase
                      visibility.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Button
                      onClick={handleCopyLink}
                      variant="outlined"
                      className="w-full"
                      size="sm"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Copy paper URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
