'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/form/Textarea';
import { Input } from '@/components/ui/form/Input';
import { FileUpload } from '@/components/ui/form/FileUpload';
import { SimpleStepProgress, SimpleStep } from '@/components/ui/SimpleStepProgress';
import {
  AuthorsAndAffiliations,
  AuthorWithAffiliation,
} from '../components/AuthorsAndAffiliations';
import { HubsSelector, Hub } from '../components/HubsSelector';
import { DeclarationCheckbox } from '../components/DeclarationCheckbox';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { UploadFileResult } from '@/services/file.service';
import { PaperService, CreatePaperPayload } from '@/services/paper.service';
import toast from 'react-hot-toast';

// Define the steps of our flow
const steps: SimpleStep[] = [
  { id: 'content', name: 'Content', description: 'Upload your paper and add basic information' },
  { id: 'authors', name: 'Authors', description: 'Add authors and affiliations' },
  { id: 'declaration', name: 'Declaration', description: 'Legal requirements and permissions' },
  { id: 'preview', name: 'Preview', description: 'Review your submission' },
];

export default function UploadPDFPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authors, setAuthors] = useState<AuthorWithAffiliation[]>([]);
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);
  const [changeDescription, setChangeDescription] = useState('Initial submission');
  const [fileUploadResult, setFileUploadResult] = useState<UploadFileResult | null>(null);

  // Declarations
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedLicense, setAcceptedLicense] = useState(false);
  const [acceptedAuthorship, setAcceptedAuthorship] = useState(false);
  const [acceptedOriginality, setAcceptedOriginality] = useState(false);

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

  const handleAuthorsChange = (newAuthors: AuthorWithAffiliation[]) => {
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

  const handleTermsChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    if (errors.terms) {
      setErrors({ ...errors, terms: null });
    }
  };

  const handleLicenseChange = (checked: boolean) => {
    setAcceptedLicense(checked);
    if (errors.license) {
      setErrors({ ...errors, license: null });
    }
  };

  const handleAuthorshipChange = (checked: boolean) => {
    setAcceptedAuthorship(checked);
    if (errors.authorship) {
      setErrors({ ...errors, authorship: null });
    }
  };

  const handleOriginalityChange = (checked: boolean) => {
    setAcceptedOriginality(checked);
    if (errors.originality) {
      setErrors({ ...errors, originality: null });
    }
  };

  const handleFileUploadError = (error: Error) => {
    console.error('File upload error:', error);
    setErrors({
      ...errors,
      file: error.message || 'Failed to upload file. Please try again.',
    });
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string | null> = {};

    switch (steps[currentStepIndex].id) {
      case 'content':
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!abstract.trim()) newErrors.abstract = 'Abstract is required';
        if (!selectedFile) newErrors.file = 'Please upload a PDF file';
        if (selectedFile && !fileUploadResult)
          newErrors.file = 'Please wait for the file to finish uploading';
        if (selectedHubs.length === 0) newErrors.hubs = 'Please select at least one topic';
        break;

      case 'authors':
        if (authors.length === 0) newErrors.authors = 'Please add at least one author';
        break;

      case 'declaration':
        if (!acceptedTerms) newErrors.terms = 'You must accept the terms and conditions';
        if (!acceptedLicense) newErrors.license = 'You must accept the license agreement';
        if (!acceptedAuthorship) newErrors.authorship = 'You must confirm authorship';
        if (!acceptedOriginality) newErrors.originality = 'You must confirm originality';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        window.scrollTo(0, 0);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    const loadingToast = toast.loading('Submitting your paper...');
    setIsSubmitting(true);

    try {
      // Create a simpler payload structure that matches the working example more closely
      const payload: CreatePaperPayload = {
        title,
        abstract,
        fileUrl: fileUploadResult?.absoluteUrl,
        changeDescription,
        authors: authors.map((author, index) => {
          const id =
            typeof author.author.id === 'number'
              ? author.author.id
              : parseInt(String(author.author.id), 10);

          // Get institution ID if available
          let institution_id: number | undefined = undefined;
          if (author.institution?.id) {
            institution_id =
              typeof author.institution.id === 'number'
                ? author.institution.id
                : parseInt(String(author.institution.id), 10);
          }

          return {
            id,
            author_position:
              index === 0 ? 'first' : index === authors.length - 1 ? 'last' : 'middle',
            institution_id,
            isCorrespondingAuthor: author.isCorrespondingAuthor,
          };
        }),
        hubs: selectedHubs.map((hub) =>
          typeof hub.id === 'number' ? hub.id : parseInt(String(hub.id), 10)
        ),
        declarations: {
          termsAccepted: acceptedTerms,
          licenseAccepted: acceptedLicense,
          authorshipConfirmed: acceptedAuthorship,
          originalityConfirmed: acceptedOriginality,
        },
      };

      // Call the paper service to create the paper
      const response = await PaperService.create(payload);

      toast.dismiss(loadingToast);
      toast.success('Paper submitted successfully!');

      // Redirect to success page
      router.push(
        `/paper/create/success?paperId=${response.id}&paperTitle=${encodeURIComponent(response.title)}`
      );
    } catch (error) {
      console.error('Submission error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to submit paper. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (steps[currentStepIndex].id) {
      case 'content':
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Paper Details</h3>
                <p className="text-sm text-gray-500">Provide basic information about your paper</p>
              </div>

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

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Paper</h3>
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

            <HubsSelector
              selectedHubs={selectedHubs}
              onChange={handleHubsChange}
              error={errors.hubs || null}
            />
          </div>
        );

      case 'authors':
        return (
          <div className="space-y-6">
            <AuthorsAndAffiliations
              authors={authors}
              onChange={handleAuthorsChange}
              error={errors.authors || null}
            />
          </div>
        );

      case 'declaration':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Declarations</h3>
              <p className="text-sm text-gray-500 mb-6">
                Please read and accept the following declarations to proceed
              </p>
            </div>

            <div className="space-y-6">
              <DeclarationCheckbox
                id="terms"
                checked={acceptedTerms}
                onChange={handleTermsChange}
                label="I accept the terms and conditions"
                description="By checking this box, you confirm that you have read and agree to the ResearchHub terms of service."
                error={errors.terms || null}
              />

              <DeclarationCheckbox
                id="license"
                checked={acceptedLicense}
                onChange={handleLicenseChange}
                label="I agree to publish under the CC BY 4.0 License"
                description="By checking this box, you license your work under the Creative Commons Attribution 4.0 International License."
                error={errors.license || null}
              />

              <DeclarationCheckbox
                id="authorship"
                checked={acceptedAuthorship}
                onChange={handleAuthorshipChange}
                label="I confirm that all authors have agreed to publish this work"
                description="By checking this box, you confirm that all authors listed have consented to this submission."
                error={errors.authorship || null}
              />

              <DeclarationCheckbox
                id="originality"
                checked={acceptedOriginality}
                onChange={handleOriginalityChange}
                label="I confirm this work is original and does not infringe on any copyrights"
                description="By checking this box, you confirm this work is original and does not infringe on anyone else's copyright."
                error={errors.originality || null}
              />
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Submission</h3>
              <p className="text-sm text-gray-500 mb-6">
                Please review your submission before finalizing
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Paper Title</h3>
                <p className="mt-1 text-gray-900">{title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Abstract</h3>
                <p className="mt-1 text-gray-900">{abstract}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">File</h3>
                <p className="mt-1 text-gray-900">{selectedFile?.name}</p>
                {fileUploadResult && (
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded successfully.{' '}
                    {fileUploadResult.absoluteUrl ? 'File is ready for submission.' : ''}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Topics</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedHubs.map((hub) => (
                    <span
                      key={hub.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {hub.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Authors</h3>
                <div className="mt-1 space-y-2">
                  {authors.map((author) => (
                    <div key={author.author.id} className="flex items-center">
                      <span className="text-gray-900">{author.author.fullName}</span>
                      {author.isCorrespondingAuthor && (
                        <span className="ml-2 text-xs text-gray-500">(Corresponding Author)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Change Description</h3>
                <Textarea
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  placeholder="Describe any changes or additional information about this submission"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <PageHeader title="Submit your research" className="mb-2" />
          <p className="text-gray-600">Upload your research paper as a PDF</p>
        </div>

        <div className="mb-8">
          <SimpleStepProgress
            steps={steps}
            currentStepIndex={currentStepIndex}
            progressSize="sm"
            showNextStep={true}
            className="w-full"
          />
        </div>

        <div className="mb-8 sm:mb-10">{renderStep()}</div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button onClick={handleBack} variant="outlined">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Button onClick={handleNext} variant="default" disabled={isSubmitting}>
            {isSubmitting ? (
              'Submitting...'
            ) : currentStepIndex === steps.length - 1 ? (
              <>
                Submit
                <Check className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
