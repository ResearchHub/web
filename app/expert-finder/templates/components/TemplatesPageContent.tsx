'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useSavedTemplates } from '@/hooks/useExpertFinder';
import { TemplatesTable } from './TemplatesTable';
import { TemplatesTableSkeleton } from './TemplatesTableSkeleton';
import type { SavedTemplate } from '@/types/expertFinder';

const PAGE_SIZE = 10;

export function TemplatesPageContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const [{ templates, pagination, isLoading, error }] = useSavedTemplates({
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleRowClick = (template: SavedTemplate) => {
    router.push(`/expert-finder/templates/${template.id}`);
  };

  function renderContent(): React.ReactNode {
    if (isLoading && templates.length === 0) {
      return (
        <div className="p-4">
          <TemplatesTableSkeleton rowCount={PAGE_SIZE} />
        </div>
      );
    } else if (templates.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600 mb-2">No templates yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Create a template to save your contact details and outreach context for generating
            emails.
          </p>
          <Link href="/expert-finder/templates/new">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Create template
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <TemplatesTable templates={templates} onRowClick={handleRowClick} />
        </div>

        {totalPages > 1 && (
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
              {pagination.total > 0 && (
                <span className="ml-2 text-gray-500">({pagination.total} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="gap-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevPage || isLoading}
              >
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                </span>
                Previous
                <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
              </Button>
              <Button
                variant="outlined"
                size="sm"
                className="gap-2"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNextPage || isLoading}
              >
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                </span>
                Next
                <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Templates</h2>
          <p className="text-sm text-gray-600">
            Save your contact details and outreach context to reuse when generating emails.
          </p>
        </div>
        {templates.length > 0 && (
          <Link href="/expert-finder/templates/new">
            <Button variant="default" size="md" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Create template
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="overflow-hidden">{renderContent()}</div>
    </div>
  );
}
