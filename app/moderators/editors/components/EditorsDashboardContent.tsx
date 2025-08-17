'use client';

import { useState, useMemo } from 'react';
import { TableContainer, SortableColumn, MobileTableCard } from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { TransformedEditorData } from '@/types/editor';
import { formatDistanceToNow } from 'date-fns';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useEditorsDashboard } from '@/hooks/useEditorsDashboard';
import { EditorTableSkeleton } from '@/components/skeletons/EditorTableSkeleton';
import { EditorMobileSkeleton } from '@/components/skeletons/EditorMobileSkeleton';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UpdateEditorModal } from './UpdateEditorModal';
import Link from 'next/link';
import { DeleteEditorModal } from './DeleteEditorModal';
import { toast } from 'react-hot-toast';
import { EditorMobileCard } from './EditorMobileCard';

export default function EditorsDashboardContent() {
  const { mdAndUp } = useScreenSize();
  const [pageSize, setPageSize] = useState(20);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<TransformedEditorData | undefined>(
    undefined
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editorToDelete, setEditorToDelete] = useState<TransformedEditorData | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const defaultFilters = useMemo(
    () => ({
      selectedHub: undefined,
      timeframe: {
        startDate: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000), // 1000 days ago
        endDate: new Date(),
      },
      orderBy: { value: 'desc' as const, label: 'Descending' },
    }),
    []
  );

  const [state, { goToPage, goToNextPage, goToPrevPage, refetch, createEditor, deleteEditor }] =
    useEditorsDashboard(defaultFilters, pageSize);

  const pageSizeOptions = [10, 20];

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const handleRowClick = (editor: TransformedEditorData) => {
    setSelectedEditor(editor);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedEditor(undefined);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEditorToDelete(null);
  };

  const handleDeleteClick = (editor: TransformedEditorData) => {
    setEditorToDelete(editor);
    setDeleteModalOpen(true);
  };

  const columns: SortableColumn[] = [
    { key: 'user', label: 'User', sortable: false },
    { key: 'lastSubmission', label: 'Last Submission', sortable: false },
    { key: 'lastComment', label: 'Last Comment', sortable: false },
    { key: 'submissions', label: 'Submissions', sortable: false },
    { key: 'tips', label: 'Tips', sortable: false },
    { key: 'comments', label: 'Comments', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const calculatePercentDiff = (current: number, previous: number): number => {
    if (current === 0) {
      if (previous > 0) return -100;
      if (previous === 0) return 0;
    }
    const val = (current - previous) / Math.max(current, previous);
    return parseFloat((val * 100).toFixed(1));
  };

  const renderContributorChange = (editor: TransformedEditorData) => {
    const { activeHubContributorCount, previousActiveHubContributorCount } = editor;

    if (
      activeHubContributorCount === undefined ||
      previousActiveHubContributorCount === undefined
    ) {
      return null;
    }

    const percentDiff = calculatePercentDiff(
      activeHubContributorCount,
      previousActiveHubContributorCount
    );

    let icon = <Minus className="h-3 w-3" />;
    let colorClass = 'text-gray-500';

    if (percentDiff > 0) {
      icon = <TrendingUp className="h-3 w-3" />;
      colorClass = 'text-green-600';
    } else if (percentDiff < 0) {
      icon = <TrendingDown className="h-3 w-3" />;
      colorClass = 'text-red-600';
    } else if (percentDiff === 0) {
      icon = <Minus className="h-3 w-3" />;
      colorClass = 'text-gray-500';
    }

    return (
      <div className={cn('flex items-center space-x-1 text-sm', colorClass)}>
        {icon}
        <span>{Math.abs(percentDiff)}%</span>
      </div>
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'never';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const renderCellContent = (row: TransformedEditorData, column: SortableColumn) => {
    switch (column.key) {
      case 'user':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={row.authorProfile.profileImage || ''}
              alt={`${row.authorProfile.firstName} ${row.authorProfile.lastName}`}
              size="sm"
              authorId={row.authorProfile.id}
              disableTooltip={true}
              className="flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <Link
                href={`/author/${row.authorProfile.id}`}
                className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors"
              >
                {`${row.authorProfile.firstName} ${row.authorProfile.lastName}`}
              </Link>
              {row.editorAddedDate && (
                <span className="text-gray-500 truncate text-xs">
                  added {formatDate(row.editorAddedDate)}
                </span>
              )}
              {/* Hub Tags */}
              {row.authorProfile.editorOfHubs && row.authorProfile.editorOfHubs.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {row.authorProfile.editorOfHubs.map((hub, hubIndex) => (
                    <Badge key={`${hub.id}-${hubIndex}`} variant="primary">
                      {hub.name}
                    </Badge>
                  ))}
                </div>
              )}
              {/* Active Hub Contributors */}
              {row.activeHubContributorCount !== null && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">
                    active hub contributors: {row.activeHubContributorCount}
                  </span>
                  {renderContributorChange(row)}
                </div>
              )}
            </div>
          </div>
        );

      case 'lastSubmission':
        return <span className="text-gray-600">{formatDate(row.latestSubmissionDate)}</span>;

      case 'lastComment':
        return <span className="text-gray-600">{formatDate(row.latestCommentDate)}</span>;

      case 'submissions':
        return <span className="font-medium text-gray-900">{row.submissionCount}</span>;

      case 'tips':
        return <span className="font-medium text-gray-900">{row.supportCount}</span>;

      case 'comments':
        return <span className="font-medium text-gray-900">{row.commentCount}</span>;

      case 'actions':
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outlined"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                handleDeleteClick(row);
              }}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              title="Delete editor"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return row[column.key as keyof TransformedEditorData];
    }
  };

  if (state.error) {
    return (
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Editors</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track editors and their contribution activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 text-center">
            <div className="text-red-500 text-lg">Error: {state.error}</div>
            <button
              onClick={() => refetch(defaultFilters)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className={`bg-white border-b border-gray-200 z-10`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Editors</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track editors and their contribution activity.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleOpenUpdateModal}
                disabled={state.isLoading}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden tablet:!block">New Editor</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area with table */}
        <div className={`flex-1 overflow-auto ${mdAndUp ? 'py-4' : 'py-6'}`}>
          {/* Page Size Selector */}
          <div className="pb-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <span>{pageSize}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  }
                  className="w-20"
                >
                  {pageSizeOptions.map((size) => (
                    <DropdownItem
                      key={size}
                      onClick={() => handlePageSizeChange(size)}
                      className={pageSize === size ? 'bg-blue-50 text-blue-700' : ''}
                    >
                      {size}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          {mdAndUp && (
            <div className="w-full max-w-full mx-auto">
              {state.isLoading ? (
                <EditorTableSkeleton columns={columns} rowCount={pageSize} />
              ) : (
                <TableContainer
                  columns={columns}
                  data={state.editors.map((row) => ({
                    ...row,
                    user: renderCellContent(row, { key: 'user', label: 'User' }),
                    lastSubmission: renderCellContent(row, {
                      key: 'lastSubmission',
                      label: 'Last Submission',
                    }),
                    lastComment: renderCellContent(row, {
                      key: 'lastComment',
                      label: 'Last Comment',
                    }),
                    submissions: renderCellContent(row, {
                      key: 'submissions',
                      label: 'Submissions',
                    }),
                    tips: renderCellContent(row, { key: 'tips', label: 'Tips' }),
                    comments: renderCellContent(row, { key: 'comments', label: 'Comments' }),
                    actions: renderCellContent(row, { key: 'actions', label: 'Actions' }),
                  }))}
                  className="w-full cursor-pointer hover:bg-gray-50"
                  onRowClick={(row) => {
                    const editor = state.editors.find((editor) => editor.id === row.id);
                    if (editor) {
                      handleRowClick(editor);
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Mobile Card View */}
          {!mdAndUp && (
            <div>
              {state.isLoading ? (
                <EditorMobileSkeleton rowCount={pageSize} />
              ) : (
                <div className="space-y-4">
                  {state.editors.map((editor, index) => (
                    <EditorMobileCard
                      key={editor.id || index}
                      editor={editor}
                      onEdit={() => handleRowClick(editor)}
                      onDelete={() => handleDeleteClick(editor)}
                      className="shadow-sm hover:shadow-md transition-shadow"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {state.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {state.currentPage} of {state.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={!state.hasPrevPage || state.isLoading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={!state.hasNextPage || state.isLoading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Editor Modal */}
      <UpdateEditorModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        selectedEditor={selectedEditor}
        createEditor={createEditor}
        deleteEditor={deleteEditor}
      />

      {/* Delete Editor Modal */}
      <DeleteEditorModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        editor={editorToDelete}
        onConfirm={deleteEditor}
      />
    </>
  );
}
