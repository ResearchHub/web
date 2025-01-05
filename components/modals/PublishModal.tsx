import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'metadata' | 'bounty' | 'declarations' | 'preview';

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('metadata');

  const steps: { id: Step; title: string }[] = [
    { id: 'metadata', title: 'Authors & Metadata' },
    { id: 'bounty', title: 'Add Bounty' },
    { id: 'declarations', title: 'Declarations' },
    { id: 'preview', title: 'Preview' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
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
              Publish Notebook
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Stepper */}
            <div className="flex justify-between mb-8">
              {steps.map((step, index) => (
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
                  {index < steps.length - 1 && (
                    <div className="w-full h-[2px] bg-gray-200 mx-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1].id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={currentStep === 'metadata'}
              >
                Back
              </button>
              <button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1].id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                {currentStep === 'preview' ? 'Publish' : 'Next'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};