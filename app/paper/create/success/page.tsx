'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Home, Eye, Share2, MessageCircle, BarChart2 } from 'lucide-react';

export default function SubmissionSuccessPage() {
  const router = useRouter();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center my-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <PageHeader title="Submission Successful!" className="mb-4" />

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Your research paper has been successfully submitted to ResearchHub. It is now being
            processed and will be available on the platform shortly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outlined"
              className="w-full sm:w-auto"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              onClick={() => router.push('/paper/123')}
              variant="default"
              className="w-full sm:w-auto"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Your Paper
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Share2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Share Your Research</h4>
                <p className="text-sm text-gray-600">
                  Share your paper with colleagues and the scientific community to increase its
                  visibility.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Engage With Feedback</h4>
                <p className="text-sm text-gray-600">
                  Respond to comments and questions from the community to foster meaningful
                  discussions.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <BarChart2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Track Metrics</h4>
                <p className="text-sm text-gray-600">
                  Monitor views, citations, and other metrics to understand your paper's impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
