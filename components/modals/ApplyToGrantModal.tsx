'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  ClipboardList as ClipboardListIcon,
  Info as InfoIcon,
  Plus as PlusIcon,
  List as ListIcon,
  ChevronLeft as ChevronLeftIcon,
  BookOpen as BookOpenIcon,
} from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';

// Type for Preregistrations in the modal
export interface PreregistrationForModal {
  id: string;
  title: string;
  status: 'published' | 'draft';
}

// Mock data for preregistrations
// TODO: This should eventually be fetched or passed as a prop
export const mockPreregistrations: PreregistrationForModal[] = [
  {
    id: 'prereg1',
    title: 'Quantum Tunneling in Bio-Molecular Systems',
    status: 'published',
  },
  {
    id: 'prereg2',
    title: 'Exploring Quantum Coherence in Photosynthetic Complexes',
    status: 'draft',
  },
  {
    id: 'prereg3',
    title: 'Advanced Qubit Design for Fault-Tolerant Quantum Computing',
    status: 'published',
  },
  {
    id: 'prereg4',
    title: 'Novel Approaches to Entanglement Swapping',
    status: 'draft',
  },
];

interface ApplyToGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  preregistrations: PreregistrationForModal[];
  selectedPreregId: string | null;
  onSelectPreregId: (id: string | null) => void;
  onUseSelected: (prereg: PreregistrationForModal) => void;
  onDraftNew: () => void;
}

export const ApplyToGrantModal: React.FC<ApplyToGrantModalProps> = ({
  isOpen,
  onClose,
  preregistrations,
  selectedPreregId,
  onSelectPreregId,
  onUseSelected,
  onDraftNew,
}) => {
  const [showPreregList, setShowPreregList] = useState(false);
  const selectedPrereg = preregistrations.find((p) => p.id === selectedPreregId);

  // Reset internal state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setShowPreregList(false);
      onSelectPreregId(null); // Reset selection as well
    }
  }, [isOpen, onSelectPreregId]);

  const handleBack = () => {
    setShowPreregList(false);
    onSelectPreregId(null); // Reset selection when going back
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={showPreregList ? 'Select Preregistration' : 'Apply to Grant'}
      maxWidth="max-w-lg"
      padding="p-0"
      headerAction={
        showPreregList ? (
          <Button
            type="button"
            variant="outlined"
            onClick={handleBack}
            className="flex items-center gap-2"
            size="icon"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
        ) : null
      }
    >
      {!showPreregList ? (
        // Initial View: Choose action with enhanced styling
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0" />

          <div className="relative p-6 space-y-10">
            {/* Header section */}
            <div className="space-y-3">
              <p className="text-base text-gray-700 font-medium leading-relaxed">
                Applying to grants on ResearchHub happens via preregistrations.
              </p>
            </div>

            {/* Action buttons with enhanced styling */}
            <div className="space-y-3">
              <Button
                variant="outlined"
                onClick={() => setShowPreregList(true)}
                className="w-full h-14 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group justify-start px-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <ListIcon size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Select Existing Preregistration</div>
                    <div className="text-xs text-gray-500">Choose from your published work</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={onDraftNew}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 group shadow-lg justify-start px-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
                    <PlusIcon size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Create New Preregistration</div>
                    <div className="text-xs text-indigo-100">Start from scratch</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Enhanced Educational Callout Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl" />
              <div className="relative bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <InfoIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-blue-900">
                      What is a Preregistration?
                    </h4>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Documenting and sharing your research plan before conducting research as well
                      as specifying funding requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Enhanced Preregistration List View
        <div className="p-6 space-y-4">
          {/* Header with icon */}
          <div className="flex items-center gap-3 pb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Your Published Preregistrations</p>
              <p className="text-xs text-gray-500">Select one to apply with</p>
            </div>
          </div>

          {/* Enhanced preregistration list */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {preregistrations.filter((p) => p.status === 'published').length > 0 ? (
              preregistrations.map((prereg) => {
                const isSelected = prereg.id === selectedPreregId;
                const isDraft = prereg.status === 'draft';
                return (
                  <div
                    key={prereg.id}
                    onClick={() => {
                      if (!isDraft) {
                        onSelectPreregId(prereg.id);
                        // Automatically use the selected preregistration
                        onUseSelected(prereg);
                      }
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${
                        isDraft
                          ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
                          : 'hover:border-green-300 hover:bg-green-50/50 border-gray-200 bg-white hover:shadow-md transform hover:-translate-y-0.5'
                      }
                      ${isSelected && !isDraft ? 'ring-2 ring-green-500 border-green-500 bg-green-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            prereg.status === 'published'
                              ? 'bg-green-100 group-hover:bg-green-200'
                              : 'bg-gray-100'
                          }`}
                        >
                          {prereg.status === 'published' ? (
                            <CheckCircleIcon size={16} className="text-green-600" />
                          ) : (
                            <CircleIcon size={12} className="text-gray-400 fill-current" />
                          )}
                        </div>
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              isDraft ? 'text-gray-500' : 'text-gray-900'
                            }`}
                          >
                            {prereg.title}
                          </span>
                          {!isDraft && (
                            <div className="text-xs text-green-600 font-medium">Published</div>
                          )}
                        </div>
                      </div>
                      {isDraft && (
                        <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  <FileTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No published preregistrations</p>
                  <p className="text-xs text-gray-500">Create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </BaseModal>
  );
};
