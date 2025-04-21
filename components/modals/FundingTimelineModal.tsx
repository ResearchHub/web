import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Pencil, FileText, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FundingTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FundingTimelineModal: React.FC<FundingTimelineModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                        <h4 className="text-lg font-medium text-gray-900">
                          Write Your Preregistration
                        </h4>
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
                        {/* <div className="mt-3">
                          <span className="text-sm text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                            ✨ Boost your campaign by uploading a research image for NFT rewards
                          </span>
                        </div> */}
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
                        <h4 className="text-lg font-medium text-gray-900">Start your Crowdfund</h4>
                        <p className="mt-2 text-gray-600">
                          Launch your campaign and let the community start funding your research
                          immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <Button onClick={onClose} size="lg">
                    Let's do it
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
