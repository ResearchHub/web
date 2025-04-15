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
import { AuthorsAndAffiliations, SelectedAuthor } from '../components/AuthorsAndAffiliations';
import { HubsSelector, Hub } from '../components/HubsSelector';
import { DeclarationCheckbox } from '../components/DeclarationCheckbox';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  FileText,
  FileUp,
  Users,
  Tags,
  X,
} from 'lucide-react';
import { UploadFileResult } from '@/services/file.service';
import { PaperService, CreatePaperPayload } from '@/services/paper.service';
import toast from 'react-hot-toast';
import { Switch } from '@/components/ui/Switch';
import { AvatarStack } from '@/components/ui/AvatarStack';

// Define the steps of our flow
const steps: SimpleStep[] = [
  {
    id: 'content',
    name: 'Content & Authors',
    description: 'Upload paper, add details and authors',
  },
  { id: 'declaration', name: 'Declaration', description: 'Legal requirements and permissions' },
  { id: 'preview', name: 'Submission', description: 'Review your submission' },
];

export default function UploadPDFPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authors, setAuthors] = useState<SelectedAuthor[]>([]);
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

  // Journal submission state
  const [submitToJournal, setSubmitToJournal] = useState(true);

  // Journal editors avatars
  const journalEditors = [
    {
      src: 'https://www.researchhub.com/static/editorial-board/MaulikDhandha.jpeg',
      alt: 'Maulik Dhandha',
      tooltip: 'Maulik Dhandha, Editor',
    },
    {
      src: 'https://www.researchhub.com/static/editorial-board/EmilioMerheb.jpeg',
      alt: 'Emilio Merheb',
      tooltip: 'Emilio Merheb, Editor',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/07/blob_48esqmw',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/23/blob_oVmwyhP',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
  ];

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

  const handleSubmitToJournalChange = (checked: boolean) => {
    setSubmitToJournal(checked);
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
        if (authors.length === 0) newErrors.authors = 'Please add at least one author';
        else if (!authors.some((author) => author.isCorrespondingAuthor)) {
          newErrors.authors = 'Please designate at least one corresponding author';
        }
        if (selectedHubs.length === 0) newErrors.hubs = 'Please select at least one topic';
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
    if (!validateCurrentStep() && currentStepIndex === steps.length - 1) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    if (!fileUploadResult?.absoluteUrl) {
      toast.error('File upload is not complete or failed.');
      setErrors({ ...errors, file: 'File upload is not complete or failed.' });
      return;
    }

    const loadingToast = toast.loading('Submitting your paper...');
    setIsSubmitting(true);

    try {
      const payload: CreatePaperPayload = {
        title,
        abstract,
        fileUrl: fileUploadResult.absoluteUrl,
        changeDescription,
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
        declarations: {
          termsAccepted: acceptedTerms,
          licenseAccepted: acceptedLicense,
          authorshipConfirmed: acceptedAuthorship,
          originalityConfirmed: acceptedOriginality,
        },
      };

      const response = await PaperService.create(payload);

      toast.dismiss(loadingToast);
      toast.success('Paper submitted successfully!');

      if (submitToJournal) {
        try {
          const successUrl = `${window.location.origin}/paper/create/success?paperId=${response.id}&paperTitle=${encodeURIComponent(response.title)}&isJournal=true`;
          const failureUrl = `${window.location.origin}/`;

          const checkoutData = await PaperService.payForJournalSubmission(
            response.id,
            successUrl,
            failureUrl
          );

          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          } else {
            throw new Error('No checkout URL received from server');
          }
        } catch (error) {
          console.error('Checkout Error:', error);
          toast.error('Failed to initiate payment. Please try again.');
          setIsSubmitting(false);
          return;
        }
      } else {
        router.push(
          `/paper/create/success?paperId=${response.id}&paperTitle=${encodeURIComponent(response.title)}&isJournal=${submitToJournal}`
        );
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to submit paper. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (steps[currentStepIndex].id) {
      case 'content':
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Paper Details</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Provide basic information about your paper
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

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileUp className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Upload Paper</h3>
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

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Authors</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Add all the authors associated with this paper
              </p>
              <div>
                <AuthorsAndAffiliations authors={authors} onChange={handleAuthorsChange} />
                {errors.authors && <p className="text-sm text-red-600 mt-2">{errors.authors}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Topics</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Select topics that best describe your research
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Choose your publishing option
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Select how you want to publish your research on ResearchHub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`border rounded-lg p-6 flex flex-col cursor-pointer ${!submitToJournal ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-lg' : 'border-gray-300 hover:shadow-md transition-shadow'}`}
                onClick={() => setSubmitToJournal(false)}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Publish on ResearchHub</h4>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">Open Access Publication</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">DOI Assignment</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">Indexed on ResearchHub</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-500">Formal Peer Review</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-500">Editorial Oversight</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-500">
                      Journal Indexing (e.g. Google Scholar)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700 font-medium">Free</span>
                  </li>
                </ul>
                <Button
                  variant={!submitToJournal ? 'default' : 'outlined'}
                  className="w-full mt-auto"
                  aria-pressed={!submitToJournal}
                >
                  {!submitToJournal && <Check className="h-4 w-4 mr-2" />}
                  Select Standard Publish
                </Button>
              </div>

              <div
                className={`border rounded-lg p-6 flex flex-col cursor-pointer ${submitToJournal ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-lg' : 'border-gray-300 hover:shadow-md transition-shadow'}`}
                onClick={() => setSubmitToJournal(true)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-indigo-900">Publish in RH Journal</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0 ml-2">
                    Limited time: Free!
                  </span>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">Open Access Publication</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">DOI Assignment</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">Indexed on ResearchHub</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">
                      Formal Peer Review (Paid Reviewers)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">Editorial Oversight</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{' '}
                    <span className="text-sm text-gray-700">
                      Journal Indexing (e.g. Google Scholar)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">
                      Free <span className="line-through text-gray-400 ml-1">$200</span> (Limited
                      Time Offer)
                    </span>
                  </li>
                </ul>
                <div className="mt-4 mb-6 text-center">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Join Open Science Advocates
                  </p>
                  <div className="flex justify-center">
                    <AvatarStack
                      items={journalEditors}
                      size="sm"
                      maxItems={7}
                      spacing={-4}
                      showExtraCount={false}
                      ringColorClass="ring-white"
                      disableTooltip={true}
                    />
                  </div>
                </div>
                <Button
                  variant={submitToJournal ? 'default' : 'outlined'}
                  className="w-full mt-auto"
                  aria-pressed={submitToJournal}
                >
                  {submitToJournal && <Check className="h-4 w-4 mr-2" />}
                  Select Journal Publish
                </Button>
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
          <PageHeader title="Publush your research" className="mb-2" />
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
              submitToJournal ? (
                'Submit & Pay'
              ) : (
                'Submit'
              )
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
