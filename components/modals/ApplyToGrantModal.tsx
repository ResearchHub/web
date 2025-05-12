'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  ClipboardList as ClipboardListIcon,
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply to Grant via Preregistration"
      maxWidth="max-w-lg"
      padding="p-0"
    >
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          To apply for this grant, you need a preregistration. You can either draft a new one or
          select from your existing published preregistrations.
        </p>

        {!showPreregList ? (
          // Initial View: Choose action
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={onDraftNew} className="w-full">
              <FileTextIcon size={16} className="mr-2" />
              Create New Preregistration
            </Button>
            <Button variant="outlined" onClick={() => setShowPreregList(true)} className="w-full">
              <ClipboardListIcon size={16} className="mr-2" />
              Select Existing Preregistration
            </Button>
          </div>
        ) : (
          // Preregistration List View
          <>
            <p className="text-sm text-gray-500 -mt-2 mb-3">
              Select one of your published preregistrations. You can also choose to draft a new one.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {preregistrations.filter((p) => p.status === 'published').length > 0 ? (
                preregistrations.map((prereg) => {
                  const isSelected = prereg.id === selectedPreregId;
                  const isDraft = prereg.status === 'draft';
                  return (
                    <div
                      key={prereg.id}
                      onClick={() => !isDraft && onSelectPreregId(prereg.id)}
                      className={`p-3 rounded-md border flex items-center justify-between
                        ${isDraft ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-100'}
                        ${isSelected && !isDraft ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center">
                        {prereg.status === 'published' ? (
                          <CheckCircleIcon
                            size={16}
                            className="text-green-500 mr-2 flex-shrink-0"
                          />
                        ) : (
                          <CircleIcon
                            size={8}
                            className="text-gray-400 fill-current mr-3 ml-1 flex-shrink-0"
                          />
                        )}
                        <span className={`text-sm ${isDraft ? 'text-gray-500' : 'text-gray-700'}`}>
                          {prereg.title}
                        </span>
                      </div>
                      {isDraft && <span className="text-xs text-gray-400 italic">Draft</span>}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">
                  You have no published preregistrations to select. Draft a new one to proceed.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-4">
              <Button
                onClick={() => {
                  if (selectedPrereg) {
                    onUseSelected(selectedPrereg);
                  }
                }}
                disabled={!selectedPrereg || selectedPrereg.status === 'draft'}
                className="w-full sm:w-auto flex-grow"
              >
                <CheckCircleIcon size={16} className="mr-2" />
                Use Selected Preregistration
              </Button>
              <Button variant="outlined" onClick={onDraftNew} className="w-full sm:w-auto">
                <FileTextIcon size={16} className="mr-2" />
                Draft New Preregistration
              </Button>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
};
