'use client';

import { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  workMetadataSchema,
  workAbstractSchema,
  type WorkMetadataFormData,
  type WorkAbstractFormData,
} from './schema';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { SearchableMultiSelect } from '@/components/ui/form/SearchableMultiSelect';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { Tabs } from '@/components/ui/Tabs';
import { Work } from '@/types/work';
import { HubService } from '@/services/hub.service';
import { getFieldErrorMessage } from '@/utils/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faLock, faLockOpen } from '@fortawesome/pro-light-svg-icons';
import { cn } from '@/utils/styles';
import { WorkAbstractEditor } from '@/components/work/WorkAbstractEditor';
import { WorkMetadata } from '@/services/metadata.service';
import { useUpdateWorkMetadata, useUpdateWorkAbstract } from '@/hooks/useDocument';
import { UpdatePaperMetadataPayload, UpdatePaperAbstractPayload } from '@/services/paper.service';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/form/Textarea';

interface WorkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: Work;
  metadata: WorkMetadata;
}

// License options with descriptions and lock status
const LICENSE_OPTIONS = [
  {
    label: 'Unknown',
    value: 'unknown',
    isLocked: true,
    description: 'The license status of this paper is unclear or not provided.',
  },
  {
    label: 'CC BY',
    value: 'cc-by',
    isLocked: false,
    description:
      'Allows others to distribute, remix, adapt, and build upon the work, even commercially, as long as they credit the author for the original creation.',
  },
  {
    label: 'CC BY-NC-ND',
    value: 'cc-by-nc-nd',
    isLocked: true,
    description:
      "Allows others to download the works and share them with others as long as they credit the author, but they can't change them in any way or use them commercially.",
  },
  {
    label: 'CC BY-NC',
    value: 'cc-by-nc',
    isLocked: true,
    description:
      "Allows others to remix, tweak, and build upon the work non-commercially, and although their new works must also acknowledge the author and be non-commercial, they don't have to license their derivative works on the same terms.",
  },
  {
    label: 'CC BY-NC-SA',
    value: 'cc-by-nc-sa',
    isLocked: true,
    description:
      'Allows others to remix, tweak, and build upon the work non-commercially, as long as they credit the author and license their new creations under the identical terms.',
  },
  {
    label: 'CC BY-SA',
    value: 'cc-by-sa',
    isLocked: false,
    description:
      'Allows others to remix, tweak, and build upon the work even for commercial purposes, as long as they credit the author and license their new creations under the identical terms.',
  },
  {
    label: 'CC BY-ND',
    value: 'cc-by-nd',
    isLocked: false,
    description:
      'Allows for redistribution, commercial and non-commercial, as long as the work is passed along unchanged and in whole, with credit to the author.',
  },
  {
    label: 'Publisher-Specific Open-Access',
    value: 'publisher-specific-oa',
    isLocked: true,
    description:
      'Open access license defined by the publisher, which may include specific restrictions and conditions.',
  },
  {
    label: 'Publisher-Specific or Author Manuscript',
    value: 'publisher-specific, author manuscript',
    isLocked: true,
    description:
      'Includes publisher-specific licenses or papers that are author manuscripts, possibly with different usage rights.',
  },
  {
    label: 'CC0 (Public Domain)',
    value: 'public-domain',
    isLocked: false,
    description:
      'Indicates that the author has waived all copyright and related rights, placing the work in the public domain.',
  },
  {
    label: 'Other Open-Access',
    value: 'other-oa',
    isLocked: true,
    description:
      'Open access license not covered by other categories, may include various less common open-access types.',
  },
];

export function WorkEditModal({ isOpen, onClose, work, metadata }: WorkEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata');

  const handleWorkRefetch = useCallback(() => {
    router.refresh();
  }, [router]);

  const metadataForm = useForm<WorkMetadataFormData>({
    resolver: zodResolver(workMetadataSchema),
    defaultValues: {
      title: work.title || '',
      doi: work.doi || '',
      publishedDate: work.publishedDate
        ? new Date(work.publishedDate).toISOString().split('T')[0]
        : '',
      topics:
        metadata.topics?.map((topic) => ({
          value: topic.id.toString(),
          label: topic.name,
        })) || [],
      license: work.license || '',
    },
  });

  const abstractForm = useForm<WorkAbstractFormData>({
    resolver: zodResolver(workAbstractSchema),
    defaultValues: {
      abstractPlainText: work.abstract || '',
      // abstractHtml: work.abstract || '',
    },
  });

  const {
    handleSubmit: handleMetadataSubmit,
    formState: { errors: metadataErrors },
    watch: metadataWatch,
    setValue: setMetadataValue,
  } = metadataForm;

  const {
    handleSubmit: handleAbstractSubmit,
    formState: { errors: abstractErrors },
    watch: abstractWatch,
    setValue: setAbstractValue,
  } = abstractForm;

  const topics = metadataWatch('topics') || [];
  const selectedLicense = metadataWatch('license');
  const abstractPlainText = abstractWatch('abstractPlainText');

  const handleTopicSearch = useCallback(async (query: string) => {
    try {
      const results = await HubService.suggestTopics(query);
      return results.map((topic) => ({
        value: topic.id.toString(),
        label: topic.name,
      }));
    } catch (error) {
      console.error('Error searching topics:', error);
      return [];
    }
  }, []);

  const [{ isLoading: isUpdatingMetadata, error: metadataError }, updateWorkMetadata] =
    useUpdateWorkMetadata();
  const [{ isLoading: isUpdatingAbstract, error: abstractError }, updateWorkAbstract] =
    useUpdateWorkAbstract();

  const isFormSubmitting = isSubmitting || isUpdatingMetadata || isUpdatingAbstract;

  const onMetadataSubmit = async (data: WorkMetadataFormData) => {
    setIsSubmitting(true);
    try {
      const payload: UpdatePaperMetadataPayload = {};

      if (data.title && data.title !== work.title) {
        payload.title = data.title;
      }

      if (data.doi && data.doi !== work.doi) {
        payload.doi = data.doi;
      }

      if (data.publishedDate) {
        payload.publishedDate = data.publishedDate;
      }

      if (data.topics) {
        payload.hubs = data.topics.map((topic) => parseInt(topic.value));
      }

      if (data.license && data.license !== work.license) {
        payload.license = data.license;
      }

      if (Object.keys(payload).length > 0) {
        await updateWorkMetadata(work.id, payload);
        handleWorkRefetch();
        toast.success('Paper metadata updated successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error updating work metadata:', error);
      toast.error('Failed to update paper metadata. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAbstractSubmit = async (data: WorkAbstractFormData) => {
    setIsSubmitting(true);
    try {
      const payload: UpdatePaperAbstractPayload = {
        // abstract_src: data.abstractHtml || '',
        abstract: data.abstractPlainText || '',
        abstract_src_type: 'TEXT_FIELD',
      };

      // Only make the API call if there are changes
      const currentAbstract = work.abstract || '';
      if (data.abstractPlainText !== currentAbstract) {
        await updateWorkAbstract(work.id, payload);
        handleWorkRefetch();
        toast.success('Paper abstract updated successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error updating work abstract:', error);
      toast.error('Failed to update paper abstract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLicenseOption = LICENSE_OPTIONS.find((option) => option.value === selectedLicense);

  const tabs = [
    { id: 'metadata', label: 'Metadata' },
    { id: 'abstract', label: 'Abstract' },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Paper"
      maxWidth="max-w-[500px]"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outlined" onClick={onClose} disabled={isFormSubmitting}>
            Cancel
          </Button>
          {activeTab === 'metadata' ? (
            <Button
              onClick={handleMetadataSubmit(onMetadataSubmit)}
              disabled={isFormSubmitting}
              className="min-w-20"
            >
              {isFormSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button
              onClick={handleAbstractSubmit(onAbstractSubmit)}
              disabled={isFormSubmitting}
              className="min-w-20"
            >
              {isFormSubmitting ? 'Saving...' : 'Save Abstract'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 md:!min-w-[500px] md:!max-w-[500px]">
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />

        {/* Tab Content */}
        {activeTab === 'metadata' && (
          <FormProvider {...metadataForm}>
            <form onSubmit={handleMetadataSubmit(onMetadataSubmit)} className="space-y-6">
              {/* Title */}
              <Input
                label="Title"
                placeholder="Paper title"
                error={getFieldErrorMessage(metadataErrors.title, 'Invalid title')}
                {...metadataForm.register('title')}
              />

              {/* DOI */}
              <Input
                label="DOI"
                placeholder="e.g., 10.1000/xyz123"
                error={getFieldErrorMessage(metadataErrors.doi, 'Invalid DOI')}
                {...metadataForm.register('doi')}
              />

              {/* Published Date */}
              <Input
                label="Published Date"
                type="date"
                error={getFieldErrorMessage(metadataErrors.publishedDate, 'Invalid date')}
                {...metadataForm.register('publishedDate')}
              />

              {/* Topics */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Topics</label>
                <SearchableMultiSelect
                  value={topics}
                  onChange={(newTopics) =>
                    setMetadataValue('topics', newTopics, { shouldValidate: true })
                  }
                  onAsyncSearch={handleTopicSearch}
                  placeholder="Search topics..."
                  debounceMs={500}
                  error={getFieldErrorMessage(metadataErrors.topics, 'Invalid topics')}
                />
              </div>

              {/* License */}
              <div>
                <Dropdown
                  label="License"
                  trigger={
                    <Button
                      variant="outlined"
                      className={cn(
                        'w-full justify-between',
                        metadataErrors.license && 'border-red-500'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={selectedLicense ? 'text-gray-900' : 'text-gray-500'}>
                          {selectedLicenseOption ? selectedLicenseOption.label : 'Select a license'}
                        </span>
                        {selectedLicenseOption && !selectedLicenseOption.isLocked && (
                          <div className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                            <FontAwesomeIcon icon={faLockOpen} className="h-3 w-3" />
                            PDF Available
                          </div>
                        )}
                      </div>
                      <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                    </Button>
                  }
                  className="max-w-md"
                >
                  <DropdownItem
                    onClick={() => setMetadataValue('license', '', { shouldValidate: true })}
                    className={!selectedLicense ? 'bg-gray-50' : ''}
                  >
                    <span className="text-gray-500">Select a license</span>
                  </DropdownItem>
                  {LICENSE_OPTIONS.map((option) => (
                    <DropdownItem
                      key={option.value}
                      onClick={() =>
                        setMetadataValue('license', option.value, { shouldValidate: true })
                      }
                      className={
                        selectedLicense === option.value ? 'bg-primary-50 text-primary-900' : ''
                      }
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{option.label}</span>
                          {!option.isLocked ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              <FontAwesomeIcon icon={faLockOpen} className="h-3 w-3" />
                              PDF Available
                            </div>
                          ) : (
                            <FontAwesomeIcon icon={faLock} className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-tight text-left">
                          {option.description}
                        </p>
                      </div>
                    </DropdownItem>
                  ))}
                </Dropdown>
                {getFieldErrorMessage(metadataErrors.license, 'Invalid license') && (
                  <p className="mt-1 text-xs text-red-500">
                    {getFieldErrorMessage(metadataErrors.license, 'Invalid license')}
                  </p>
                )}
              </div>
            </form>
          </FormProvider>
        )}

        {activeTab === 'abstract' && (
          <FormProvider {...abstractForm}>
            <form onSubmit={handleAbstractSubmit(onAbstractSubmit)} className="space-y-6">
              <Textarea
                label="Abstract"
                placeholder="Enter paper abstract..."
                error={getFieldErrorMessage(abstractErrors.abstractPlainText, 'Invalid abstract')}
                {...abstractForm.register('abstractPlainText')}
                className="min-h-[150px]"
              />
            </form>
          </FormProvider>
        )}
      </div>
      {(metadataError || abstractError) && (
        <div className="text-red-500 text-sm mt-2">{metadataError || abstractError}</div>
      )}
    </BaseModal>
  );
}
