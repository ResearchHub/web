'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { useSavedTemplates } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import { TemplatesTable, TEMPLATES_TABLE_COLUMNS } from './TemplatesTable';
import { TemplateMobileCard } from './TemplateMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import type { SavedTemplate } from '@/types/expertFinder';
import { EXPERT_FINDER_LIST_PAGE_SIZE } from '@/app/expert-finder/lib/paginationParams';

export function TemplatesPageContent() {
  const router = useRouter();
  const { mdAndUp } = useScreenSize();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * EXPERT_FINDER_LIST_PAGE_SIZE;
  const [{ templates, pagination, isLoading, error }] = useSavedTemplates({
    limit: EXPERT_FINDER_LIST_PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(pagination.total / EXPERT_FINDER_LIST_PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleRowClick = (template: SavedTemplate) => {
    router.push(`/expert-finder/templates/${template.id}`);
  };

  function renderContent(): React.ReactNode {
    if (isLoading && templates.length === 0) {
      return (
        <div className="p-4">
          {mdAndUp ? (
            <TableSkeleton
              columns={TEMPLATES_TABLE_COLUMNS}
              rowCount={EXPERT_FINDER_LIST_PAGE_SIZE}
            />
          ) : (
            <ListCardSkeleton rowCount={EXPERT_FINDER_LIST_PAGE_SIZE} />
          )}
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
        {mdAndUp ? (
          <div className="overflow-x-auto">
            <TemplatesTable templates={templates} onRowClick={handleRowClick} />
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template, index) => (
              <TemplateMobileCard
                key={template.id ?? index}
                template={template}
                onClick={() => handleRowClick(template)}
                className="shadow-sm"
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
              {pagination.total > 0 && (
                <span className="ml-2 text-gray-500">({pagination.total} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PaginationButton
                label="Previous"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevPage || isLoading}
                isLoading={isLoading}
              />
              <PaginationButton
                label="Next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNextPage || isLoading}
                isLoading={isLoading}
              />
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
          <Breadcrumbs items={[{ label: 'Templates' }]} className="mb-2" />
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
