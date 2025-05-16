'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/form/Textarea';
import { Input } from '@/components/ui/form/Input';
import { FileUpload } from '@/components/ui/form/FileUpload';
import {
  AuthorsAndAffiliations,
  SelectedAuthor,
} from '@/app/paper/create/components/AuthorsAndAffiliations';
import { HubsSelector, Hub } from '@/app/paper/create/components/HubsSelector';
import { FileText, FileUp, Users, Tags, ArrowLeft } from 'lucide-react';
import { UploadFileResult } from '@/services/file.service';
import { PaperService } from '@/services/paper.service';
import toast from 'react-hot-toast';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';

interface UploadVersionFormProps {
  initialPaper: Work;
  previousPaperId: number;
  metadata?: WorkMetadata;
}

export default function UploadVersionForm({
  initialPaper,
  previousPaperId,
  metadata,
}: UploadVersionFormProps) {
  const router = useRouter();

  // Form state with initial values from the existing paper
  const [title, setTitle] = useState(initialPaper.title || '');
  const [abstract, setAbstract] = useState(initialPaper.abstract || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authors, setAuthors] = useState<SelectedAuthor[]>(() =>
    initialPaper.authors.map((auth) => ({
      author: {
        id: auth.authorProfile.id,
        fullName: auth.authorProfile.fullName,
        profileImage: auth.authorProfile.profileImage,
        headline: auth.authorProfile.headline,
        profileUrl: auth.authorProfile.profileUrl,
      },
      isCorrespondingAuthor: auth.isCorresponding,
    }))
  );
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>(() => {
    const sourceTopics = metadata?.topics ?? initialPaper.topics;
    return sourceTopics.map((topic) => ({
      id: topic.id,
      name: topic.name,
    }));
  });
  const [fileUploadResult, setFileUploadResult] = useState<UploadFileResult | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers with error clearing
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors({ ...errors, title: null });
    }
  };

  const handleAbstractChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAbstract(e.target.value);
    if (errors.abstract) {
      setErrors({ ...errors, abstract: null });
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (errors.file) {
      setErrors({ ...errors, file: null });
    }
  };

  const handleFileUpload = (result: UploadFileResult) => {
    setFileUploadResult(result);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileUploadResult(null);
    if (errors.file) {
      setErrors({ ...errors, file: null });
    }
  };

  const handleFileUploadError = (error: Error) => {
    console.error('File upload error:', error);
    setErrors({
      ...errors,
      file: error.message || 'Failed to upload file. Please try again.',
    });
  };

  const handleAuthorsChange = (newAuthors: SelectedAuthor[]) => {
    setAuthors(newAuthors);
    if (errors.authors) {
      setErrors({ ...errors, authors: null });
    }
  };

  const handleHubsChange = (newHubs: Hub[]) => {
    setSelectedHubs(newHubs);
    if (errors.hubs) {
      setErrors({ ...errors, hubs: null });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!abstract.trim()) newErrors.abstract = 'Abstract is required';
    if (!selectedFile) newErrors.file = 'Please upload a PDF file';
    if (selectedFile && !fileUploadResult)
      newErrors.file = 'Please wait for the file to finish uploading';
    if (authors.length === 0) newErrors.authors = 'Please add at least one author';
    else if (!authors.some((author) => author.isCorrespondingAuthor)) {
      newErrors.authors = 'Please designate at least one corresponding author';
    }
    if (selectedHubs.length === 0) newErrors.hubs = 'Please select at least one topic';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!fileUploadResult?.absoluteUrl) {
      toast.error('File upload is not complete or failed.');
      setErrors({ ...errors, file: 'File upload is not complete or failed.' });
      return;
    }

    const loadingToast = toast.loading('Submitting new version...');
    setIsSubmitting(true);

    try {
      const response = await PaperService.create({
        title,
        abstract,
        fileUrl: fileUploadResult.absoluteUrl,
        changeDescription: 'New version',
        authors: authors.map((selectedAuthor, index) => {
          const id =
            typeof selectedAuthor.author.id === 'number'
              ? selectedAuthor.author.id
              : parseInt(String(selectedAuthor.author.id), 10);

          return {
            id,
            author_position:
              index === 0 ? 'first' : index === authors.length - 1 ? 'last' : 'middle',
            institution_id: undefined,
            isCorrespondingAuthor: selectedAuthor.isCorrespondingAuthor,
          };
        }),
        hubs: selectedHubs.map((hub) =>
          typeof hub.id === 'number' ? hub.id : parseInt(String(hub.id), 10)
        ),
        previousPaperId: previousPaperId,
        declarations: {
          termsAccepted: true,
          licenseAccepted: true,
          authorshipConfirmed: true,
          originalityConfirmed: true,
        },
      });

      // Fetch the newly created paper to obtain its slug for redirection
      const newPaper = await PaperService.get(String(response.id));

      toast.dismiss(loadingToast);
      toast.success('New version submitted successfully!');

      router.push(`/paper/${newPaper.id}/${newPaper.slug}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to submit new version. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <PageHeader title="Create a new version" className="mb-2" />
          <p className="text-gray-600">Update your paper and upload a new PDF</p>
        </div>

        {/* Content Form */}
        <div className="space-y-8 mb-10">
          {/* Paper Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Paper Details</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Provide updated information about your paper
            </p>
            <div>
              <Input
                label="Title"
                value={title}
                onChange={handleTitleChange}
                error={errors.title || undefined}
                required
              />
            </div>
            <div>
              <Textarea
                label="Abstract"
                value={abstract}
                onChange={handleAbstractChange}
                error={errors.abstract || undefined}
                rows={5}
                required
              />
            </div>
          </div>

          {/* Upload Paper */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileUp className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Upload Updated PDF</h3>
            </div>
            <div>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                onFileUpload={handleFileUpload}
                onError={handleFileUploadError}
                uploadImmediately={true}
                selectedFile={selectedFile}
                error={errors.file || null}
              />
            </div>
          </div>

          {/* Authors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Authors</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Update the list of authors associated with this version
            </p>
            <div>
              <AuthorsAndAffiliations authors={authors} onChange={handleAuthorsChange} />
              {errors.authors && <p className="text-sm text-red-600 mt-2">{errors.authors}</p>}
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Topics</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Update the topics that best describe your research
            </p>
            <div>
              <HubsSelector
                selectedHubs={selectedHubs}
                onChange={handleHubsChange}
                error={errors.hubs || null}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button onClick={() => router.back()} variant="outlined">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          <Button onClick={handleSubmit} variant="default" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit New Version'}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
