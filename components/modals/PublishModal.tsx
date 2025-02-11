import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreatePost } from '@/hooks/useDocument';
import { FundingFormData } from '../Editor/components/Funding/FundingForm';
import { ArticleType } from '../Editor/components/Sidebar/PublishingSidebar';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleType: ArticleType;
  fundingData: FundingFormData;
  title: string;
}

type Step = 'type' | 'metadata' | 'bounty' | 'declarations' | 'preview';
type PublicationType = 'research' | 'grant';

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  articleType,
  fundingData,
  title,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [publicationType, setPublicationType] = useState<PublicationType>('research');
  const router = useRouter();
  const [{ isLoading }, createPreregistrationPost] = useCreatePost();
  const { editor } = useNotebookPublish();

  const steps: { id: Step; title: string }[] = [
    { id: 'type', title: 'Type' },
    { id: 'metadata', title: 'Authors & Metadata' },
    { id: 'bounty', title: 'Add Bounty' },
    { id: 'declarations', title: 'Declarations' },
    { id: 'preview', title: 'Preview' },
  ];

  const handleTypeSelection = (type: PublicationType) => {
    setPublicationType(type);
    if (type === 'grant') {
      onClose();
      router.push('/notebook/new?type=grant');
    } else {
      setCurrentStep('metadata');
    }
  };

  const handlePublish = async () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (articleType === 'preregistration') {
      try {
        const response = await createPreregistrationPost({
          ...fundingData,
          title,
          noteId: 1, //'TODO',
          renderable_text: 'TODO',
          // Add other required fields from the form
          // background: '', // This should come from the editor
          // hypothesis: '', // This should come from the editor
          // methods: '', // This should come from the editor
          // budgetUse: '', // This should come from the form
        });

        router.push(`/fund/${response.id}/${response.slug}`);
        onClose();
      } catch (error) {
        console.error('Error publishing:', error);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Publication Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelection('research')}
                className={`p-4 border rounded-lg text-left hover:border-indigo-600 transition-colors ${
                  publicationType === 'research'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <h4 className="font-medium">Research Article</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Publish your research findings with methods, results, and discussion
                </p>
              </button>
              <button
                onClick={() => handleTypeSelection('grant')}
                className={`p-4 border rounded-lg text-left hover:border-indigo-600 transition-colors ${
                  publicationType === 'grant' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <h4 className="font-medium">Grant Proposal</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new grant proposal with project description and budget
                </p>
              </button>
            </div>
          </div>
        );
      case 'metadata':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Authors & Metadata</h3>
            {/* Add author and metadata form fields here */}
          </div>
        );
      case 'bounty':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add Bounty</h3>
            {/* Add bounty toggle and related fields here */}
          </div>
        );
      case 'declarations':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Declarations</h3>
            {/* Add declarations form here */}
          </div>
        );
      case 'preview':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            {/* Add preview content here */}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">
              {currentStep === 'type' ? 'Select Publication Type' : 'Publish Notebook'}
            </Dialog.Title>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {currentStep !== 'type' && (
              <div className="flex justify-between mb-8">
                {steps.slice(1).map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === step.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium">{step.title}</span>
                    {index < steps.length - 2 && (
                      <div className="w-full h-[2px] bg-gray-200 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {renderStepContent()}

            {currentStep !== 'type' && (
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => {
                    const currentIndex = steps.findIndex((s) => s.id === currentStep);
                    if (currentIndex > 1) {
                      setCurrentStep(steps[currentIndex - 1].id);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={currentStep === 'metadata'}
                >
                  Back
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {isLoading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
