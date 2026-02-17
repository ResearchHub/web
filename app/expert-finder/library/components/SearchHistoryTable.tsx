'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { SearchStatusBadge } from './SearchStatusBadge';
import { formatTimestamp } from '@/utils/date';
import type { ExpertSearchListItem } from '@/types/expertFinder';

const SEARCH_DETAIL_PATH = '/expert-finder/searches';
const QUERY_TRUNCATE_LENGTH = 60;

function truncateQuery(query: string): string {
  if (!query) return '—';
  return query.length <= QUERY_TRUNCATE_LENGTH
    ? query
    : `${query.slice(0, QUERY_TRUNCATE_LENGTH)}…`;
}

const COLUMNS: SortableColumn[] = [
  { key: 'query', label: 'Query', sortable: false },
  { key: 'expertCount', label: 'Expert Count', sortable: false },
  { key: 'createdAt', label: 'Created At', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'view', label: '', sortable: false },
];

interface SearchHistoryTableProps {
  searches: ExpertSearchListItem[];
  onRowClick?: (search: ExpertSearchListItem) => void;
}

export function SearchHistoryTable({ searches, onRowClick }: SearchHistoryTableProps) {
  const data = searches.map((search) => ({
    searchId: search.searchId,
    query: truncateQuery(search.query),
    status: <SearchStatusBadge status={search.status} />,
    expertCount: search.status === 'completed' ? search.expertCount : '—',
    createdAt: formatTimestamp(search.createdAt, false),
    view: (
      <Link
        href={`${SEARCH_DETAIL_PATH}/${search.searchId}`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </Link>
    ),
  }));

  return (
    <TableContainer
      columns={COLUMNS}
      data={data}
      rowKey="searchId"
      className="w-full cursor-pointer"
      onRowClick={(row) => {
        const search = searches.find((s) => s.searchId === row.searchId);
        if (search) onRowClick?.(search);
      }}
    />
  );
}

export { COLUMNS as SEARCH_HISTORY_COLUMNS };
