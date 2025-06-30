import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bell, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SocialShareButtons from '@/components/SocialShareButtons';

interface NewFundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalUrl?: string;
}

export const NewFundingModal: React.FC<NewFundingModalProps> = ({
  isOpen,
  onClose,
  proposalUrl = window.location.href,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(proposalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Custom Header with Success Checkmark */}
                <div className="text-center mb-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                    <Check className="h-10 w-10 text-green-600" strokeWidth={2} />
                  </div>
                  <Dialog.Title as="h2" className="text-2xl font-semibold text-gray-900 mb-3">
                    Congratulations on launching your Fundraise
                  </Dialog.Title>
                  <p className="text-gray-600">
                    To get the most out of your fundraise, consider the following:
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Section 1: Updates */}
                  <div className="flex gap-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-white">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50/70">
                        <Bell className="h-7 w-7 text-primary-600 stroke-[1.5]" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="pt-1">
                      <h4 className="text-lg font-medium text-gray-900">Provide regular updates</h4>
                      <p className="mt-2 text-gray-600">
                        Keep your funders engaged by providing regular updates about the status of
                        your research.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                          Aim to provide at least one update per month to maintain 100% update rate
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                          Providing regular monthly updates will boost your visibility to future
                          funders
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Social Media Sharing */}
                  <div className="flex gap-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-white">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50/70">
                        <Share2
                          className="h-7 w-7 text-primary-600 stroke-[1.5]"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    <div className="pt-1 flex-1">
                      <h4 className="text-lg font-medium text-gray-900">Share your proposal</h4>
                      <p className="mt-2 text-gray-600">
                        Share a link to your proposal on social media to increase visibility and
                        attract more funders.
                      </p>
                      <div className="mt-4 flex flex-col gap-4">
                        <div className="flex justify-start">
                          <Button
                            onClick={handleCopyLink}
                            variant="outlined"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </div>
                        {/* Social share buttons */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 text-left">
                            Or share directly on:
                          </p>
                          <SocialShareButtons
                            action="USER_OPENED_PROPOSAL"
                            docTitle="Your Fundraise"
                            url={proposalUrl}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <Button onClick={onClose} size="lg">
                    Got it
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
