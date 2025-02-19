'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Button } from '@/components/ui/Button';
import { Upload, ArrowRight } from 'lucide-react';
import { SubmissionTiers } from './SubmissionTiers';

type Step = 'content' | 'authors' | 'declarations' | 'preview';

interface WorkSubmissionFormProps {
  onStepChange?: (step: Step) => void;
}

export function WorkSubmissionForm({ onStepChange }: WorkSubmissionFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('content');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [topics, setTopics] = useState('');

  const steps: { id: Step; name: string }[] = [
    { id: 'content', name: 'Content' },
    { id: 'authors', name: 'Authors' },
    { id: 'declarations', name: 'Declarations' },
    { id: 'preview', name: 'Preview' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextStep = 'preview';
    setCurrentStep(nextStep);
    onStepChange?.(nextStep);
  };

  if (currentStep === 'preview') {
    return (
      <div className="space-y-8">
        <div className="mb-12">
          <div className="flex flex-col space-y-2">
            <div className="flex w-full gap-2">
              {steps.map((step, stepIdx) => (
                <div key={step.name} className="flex-1">
                  <div
                    className={`
                      h-1 rounded-full bg-indigo-600
                      transition-colors duration-300
                    `}
                  />
                </div>
              ))}
            </div>
            <div className="flex w-full gap-2">
              {steps.map((step, stepIdx) => (
                <div key={step.name} className="text-sm font-medium flex-1 text-indigo-600">
                  {step.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose your publication type</h2>
          <SubmissionTiers />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="mb-12">
        <div className="flex flex-col space-y-2">
          <div className="flex w-full gap-2">
            {steps.map((step, stepIdx) => {
              const isCurrentStep = currentStep === step.id;
              const isCompleted = steps.findIndex((s) => s.id === currentStep) > stepIdx;
              return (
                <div key={step.name} className="flex-1">
                  <div
                    className={`
                      h-1 rounded-full
                      ${isCompleted ? 'bg-indigo-600' : isCurrentStep ? 'bg-indigo-600' : 'bg-gray-200'}
                      transition-colors duration-300
                    `}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex w-full gap-2">
            {steps.map((step, stepIdx) => {
              const isCurrentStep = currentStep === step.id;
              const isCompleted = steps.findIndex((s) => s.id === currentStep) > stepIdx;
              return (
                <div
                  key={step.name}
                  className={`
                    text-sm font-medium flex-1
                    ${isCompleted || isCurrentStep ? 'text-indigo-600' : 'text-gray-500'}
                  `}
                >
                  {step.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${file ? 'text-green-500' : 'text-gray-400'}`} />
          {file ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Drag and drop your PDF file here</p>
              <p className="text-sm text-gray-500">or</p>
              <label className="inline-block">
                <span className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer">
                  Browse files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of your paper"
            className="mt-1"
            inputSize="lg"
            labelClassName="font-semibold text-sm"
          />
        </div>

        <div>
          <Textarea
            id="abstract"
            label="Abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Enter the abstract of your paper"
            className="mt-1 text-base px-4 py-3 min-h-[150px] resize-none"
            rows={6}
            labelClassName="font-semibold text-sm"
          />
        </div>

        <div>
          <Input
            id="topics"
            label="Topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Enter topics (comma separated)"
            className="mt-1"
            inputSize="lg"
            labelClassName="font-semibold text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-lg font-medium flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
