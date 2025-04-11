'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WS_ROUTES } from '@/services/websocket';
import { transformNotification } from '@/types/notification';
import { Button } from '@/components/ui/Button';
import { Info, ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/form/Input';
import { Spinner } from '@/components/Editor/components/ui/Spinner';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { usePublicationsSearch, useAddPublications } from '@/hooks/usePublications';
import { PublicationError } from '@/services/publication.service';
import { Avatar } from '@/components/ui/Avatar';
import { VerificationPaperResult } from './VerificationPaperResult';

export type STEP =
  | 'DOI'
  | 'NEEDS_AUTHOR_CONFIRMATION'
  | 'RESULTS'
  | 'ERROR'
  | 'LOADING'
  | 'FINISHED';

type ERROR_TYPE = 'DOI_NOT_FOUND' | 'GENERIC_ERROR' | null;

export const ORDERED_STEPS: Array<STEP> = [
  'DOI',
  'NEEDS_AUTHOR_CONFIRMATION',
  'RESULTS',
  'LOADING',
  'FINISHED',
];

interface AddPublicationsFormProps {
  onStepChange?: ({ step }: { step: STEP }) => void;
  onDoThisLater?: () => void;
  allowDoThisLater?: boolean;
}

export function AddPublicationsForm({
  onStepChange,
  onDoThisLater,
  allowDoThisLater = false,
}: AddPublicationsFormProps) {
  const [paperDoi, setPaperDoi] = useState('');
  const [selectedPaperIds, setSelectedPaperIds] = useState<Array<string>>([]);
  const [step, setStep] = useState<STEP>('DOI');
  const [error, setError] = useState<ERROR_TYPE>(null);

  const { user } = useUser();

  // Use our custom hooks
  const [{ data, isLoading: isSearchLoading, error: searchError }, searchPublications] =
    usePublicationsSearch();

  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  const [{ isLoading: isAddingLoading, error: addError }, addPublications] = useAddPublications();

  // Connect to WebSocket for publication status updates
  const { messages } = useWebSocket({
    url: user?.id ? WS_ROUTES.NOTIFICATIONS(user.id) : '',
    authRequired: true,
    autoConnect: !!user?.id,
    global: true,
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const latestNotification = transformNotification(latestMessage);

      if (latestNotification.type === 'PUBLICATIONS_ADDED') {
        setStep('FINISHED');
      }
    }
  }, [messages]);

  // Notify parent component when step changes and reset error
  useEffect(() => {
    onStepChange?.({ step });
    setError(null);
  }, [step, onStepChange]);

  // Handle errors from hooks
  useEffect(() => {
    if (searchError) {
      if (searchError instanceof PublicationError && searchError.code === 'DOI_NOT_FOUND') {
        setError('DOI_NOT_FOUND');
      } else {
        setError('GENERIC_ERROR');
      }
    }
  }, [searchError]);

  useEffect(() => {
    if (addError) {
      setError('GENERIC_ERROR');
      setStep('ERROR');
    }
  }, [addError]);

  // Update step based on search results
  useEffect(() => {
    if (data) {
      if (!data.selectedAuthorId) {
        setStep('NEEDS_AUTHOR_CONFIRMATION');
      } else if (data.selectedAuthorId && (data.works || []).length > 0) {
        setStep('RESULTS');
      }

      // Set the first publication as selected if it matches the DOI
      if ((data.works || []).length > 0 && selectedPaperIds.length === 0) {
        setSelectedPaperIds([(data.works || [])[0].id]);
      }
    }
  }, [data]);

  const handleFetchPublications = async ({
    doi,
    authorId,
  }: {
    doi: string;
    authorId?: string | null;
  }) => {
    setError(null);
    try {
      await searchPublications({ doi, authorId });
    } catch (err) {
      // Error handling is done in the useEffect above
    }
  };

  const handleDoThisLater = () => {
    onDoThisLater?.();
    toast.success('Visit the "Publications" tab on your profile to resume', {
      duration: 5000,
    });
  };

  const handleAddPublications = async () => {
    setStep('LOADING');
    try {
      await addPublications({
        authorId: String(user?.authorProfile?.id) || '',
        openAlexPublicationIds: selectedPaperIds,
        openAlexAuthorId: selectedAuthorId || '',
      });
      // The actual completion will be handled by the WebSocket notification
    } catch (err) {
      // Error handling is done in the useEffect above
    }
  };

  const toggleSelectAll = () => {
    if (selectedPaperIds.length === (data?.works || []).length) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds((data?.works || []).map((pub) => pub.id));
    }
  };

  const togglePaperSelection = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      setSelectedPaperIds(selectedPaperIds.filter((id) => id !== paperId));
    } else {
      setSelectedPaperIds([...selectedPaperIds, paperId]);
    }
  };

  return (
    <div className="w-full">
      {step === 'DOI' && (
        <div>
          <div className="mb-6">
            <Input
              id="doi"
              label="Enter a DOI for any paper you've published"
              placeholder="e.g., 10.1038/s41586-021-03819-2"
              value={paperDoi}
              onChange={(e) => setPaperDoi(e.target.value)}
              className="w-full"
              error={(() => {
                switch (error) {
                  case 'DOI_NOT_FOUND':
                    return "We couldn't find this DOI. Please check that you've entered it correctly or try a different publication.";
                  case 'GENERIC_ERROR':
                    return 'An error occurred. Please enter a valid DOI and try again.';
                  default:
                    return undefined;
                }
              })()}
            />
          </div>

          <div className="flex justify-between items-center mt-8">
            {allowDoThisLater && (
              <Button variant="ghost" onClick={handleDoThisLater} className="text-primary">
                Do this later
              </Button>
            )}
            <Button
              onClick={() => handleFetchPublications({ doi: paperDoi })}
              disabled={!paperDoi.trim() || isSearchLoading}
              className="ml-auto"
            >
              {isSearchLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'NEEDS_AUTHOR_CONFIRMATION' && (
        <div>
          <div className="mb-6 relative">
            <p className="mb-2">Please confirm which of these authors you are:</p>

            <Dropdown
              label="Author"
              required={true}
              trigger={
                <Button
                  variant="outlined"
                  className="flex items-center justify-between w-full"
                  type="button"
                >
                  <span className="text-gray-700">
                    {selectedAuthorId
                      ? (data?.availableAuthors || []).find(
                          (author) => author.id === selectedAuthorId
                        )?.displayName
                      : 'Select an author'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              }
            >
              {(data?.availableAuthors || []).map((author) => (
                <DropdownItem
                  key={author.id}
                  onClick={() => setSelectedAuthorId(author.id)}
                  className={selectedAuthorId === author.id ? 'bg-gray-100' : ''}
                >
                  {author.displayName}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                setStep('DOI');
                setSelectedAuthorId(null);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => handleFetchPublications({ doi: paperDoi, authorId: selectedAuthorId })}
              disabled={!selectedAuthorId || isSearchLoading}
            >
              {isSearchLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'RESULTS' && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Checkbox
                id="select-all-publications"
                label={`Select All (${selectedPaperIds.length})`}
                checked={
                  selectedPaperIds.length === (data?.works || []).length &&
                  (data?.works || []).length > 0
                }
                onCheckedChange={toggleSelectAll}
                className="[&>div>label]:text-indigo-600"
              />

              {selectedAuthorId && data?.availableAuthors && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      alt={
                        data.availableAuthors.find((author) => author.id === selectedAuthorId)
                          ?.displayName || 'Author'
                      }
                      size="sm"
                    />
                    <span className="text-sm text-gray-700">
                      {
                        data.availableAuthors.find((author) => author.id === selectedAuthorId)
                          ?.displayName
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => setStep('NEEDS_AUTHOR_CONFIRMATION')}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    (Change)
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {(data?.works || []).map((publication) => (
                <div
                  key={publication.id}
                  className={`border rounded-md p-4 ${
                    selectedPaperIds.includes(publication.id)
                      ? 'border-indigo-600'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`paper-${publication.id}`}
                      checked={selectedPaperIds.includes(publication.id)}
                      className="mt-1"
                      onCheckedChange={(checked) => {
                        togglePaperSelection(publication.id);
                      }}
                    />
                    <VerificationPaperResult result={publication} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                if ((data?.availableAuthors || []).length > 0) {
                  setStep('NEEDS_AUTHOR_CONFIRMATION');
                } else {
                  setStep('DOI');
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleAddPublications}
              disabled={selectedPaperIds.length === 0 || isAddingLoading}
            >
              {isAddingLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Add Publications
            </Button>
          </div>
        </div>
      )}

      {step === 'LOADING' && (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Spinner className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Adding publications to your profile...</h3>
          <p className="text-gray-600">
            This may take a few minutes. We will notify you when the process is complete. Feel free
            to close this popup.
          </p>
        </div>
      )}

      {step === 'ERROR' && (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4 text-red-500">
            <Info className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">
            An unexpected error has occurred. Please try again later.
          </p>
          <Button onClick={() => setStep('DOI')}>Try Again</Button>
        </div>
      )}
    </div>
  );
}
