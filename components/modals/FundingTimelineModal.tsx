import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useState } from 'react';
import { Pencil, FileText, Rocket, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { detectImportFormat } from '@/components/Editor/lib/convert';

interface FundingTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called when the user picks "Start from template". The parent is
   * responsible for creating the proposal note from the proposal template
   * and navigating to it.
   */
  onStartFromTemplate?: () => void | Promise<void>;
  /**
   * Called when the user picks "Upload a file" and selects a valid
   * document. The parent is responsible for converting the file and
   * creating the proposal note.
   */
  onUploadFile?: (file: File) => void | Promise<void>;
  /**
   * Disables both CTAs and shows a spinner. Use while the parent is
   * creating/converting the note.
   */
  isProcessing?: boolean;
}

// File-picker accept hint. Matches the canonical list in `NoteCreationModal`
// so the proposal upload flow accepts the exact same formats as the sidebar.
const ACCEPT_ATTR = [
  '.docx',
  '.odt',
  '.md',
  '.markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/markdown',
].join(',');

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const FundingTimelineModal: React.FC<FundingTimelineModalProps> = ({
  isOpen,
  onClose,
  onStartFromTemplate,
  onUploadFile,
  isProcessing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const openFilePicker = () => {
    setFileError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = ''; // allow re-selecting the same file
    if (!picked) return;

    if (!detectImportFormat(picked)) {
      setFileError('Only .docx, .odt, and .md files are supported.');
      return;
    }
    if (picked.size > MAX_FILE_SIZE) {
      setFileError('That file is larger than 25 MB. Try a smaller document.');
      return;
    }

    setFileError(null);
    void onUploadFile?.(picked);
  };

  // The modal is dismissable by ESC/backdrop click only while the parent
  // isn't mid-creation — otherwise the user could close it while a note is
  // being conjured up in the background, leaving them on an unhelpful page.
  const handleDialogClose = () => {
    if (isProcessing) return;
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleDialogClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Get Started with Research Funding
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Complete these steps to launch your crowdfunding campaign.
                  </p>
                </Dialog.Title>

                <div className="space-y-8">
                  {/* Timeline Steps */}
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-8 top-8 h-[calc(100%-4rem)] w-0.5 bg-primary-100" />

                    {/* Step 1 */}
                    <div className="relative flex gap-6 h-32">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50/70">
                          <Pencil
                            className="h-7 w-7 text-primary-600 stroke-[1.5]"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                      <div className="pt-1">
                        <h4 className="text-lg font-medium text-gray-900">Write Your Proposal</h4>
                        <p className="mt-2 text-gray-600">
                          Describe your research methodology and explain why your study matters.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex gap-6 h-32">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50/70">
                          <FileText
                            className="h-7 w-7 text-primary-600 stroke-[1.5]"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                      <div className="pt-1">
                        <h4 className="text-lg font-medium text-gray-900">Add Project Details</h4>
                        <p className="mt-2 text-gray-600">
                          Add authors and topics in the sidebar. Include the funding goal from your
                          document.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex gap-6">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50/70">
                          <Rocket
                            className="h-7 w-7 text-primary-600 stroke-[1.5]"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                      <div className="pt-1">
                        <h4 className="text-lg font-medium text-gray-900">Launch your Campaign</h4>
                        <p className="mt-2 text-gray-600">
                          Launch your campaign and let the community start funding your research
                          immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                  {fileError && (
                    <p className="text-sm text-red-600 text-right" role="alert">
                      {fileError}
                    </p>
                  )}
                  {isProcessing && (
                    <p className="text-sm text-gray-500 text-right">
                      Preparing your proposal — this can take a few seconds...
                    </p>
                  )}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outlined"
                      size="lg"
                      onClick={openFilePicker}
                      disabled={isProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload a file
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => void onStartFromTemplate?.()}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating
                        </>
                      ) : (
                        'Start from template'
                      )}
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
