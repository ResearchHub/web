import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExternalLink, Rocket, Hammer } from 'lucide-react';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="border-b border-gray-200 -mx-6 px-6 pb-4 mb-6">
    <div className="flex justify-between items-center">
      <Dialog.Title as="h2" className="text-xl font-semibold text-gray-900">
        {title}
      </Dialog.Title>
      <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
        <span className="sr-only">Close</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
);

export function ReleaseNotesModal({ isOpen, onClose }: ReleaseNotesModalProps) {
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <ModalHeader title="Release Notes" onClose={onClose} />

                  <div className="space-y-6">
                    {/* Roadmap Link Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        ResearchHub Roadmap
                      </h3>
                      <a
                        href="https://researchhub.notion.site/Roadmap-Goals-155eee9de1af8095a998cf79a27bfed9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-500"
                      >
                        View Full Roadmap <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Next Up Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-gray-600" />
                        Next Up
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" disabled />
                          <span className="text-gray-700">Lab Notebook V2</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" disabled />
                          <span className="text-gray-700">Dynamic Feed</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" disabled />
                          <span className="text-gray-700">Preregistration posting</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" disabled />
                          <span className="text-gray-700">
                            Wire up bounty creation w/added functionality
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" disabled />
                          <span className="text-gray-700">Profile page UX</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" disabled />
                          <span className="text-gray-700">Comments + New editor</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipped Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-gray-600" />
                        Shipped
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">01/31/2024</div>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                            <li>Fetch lists of journals, topics, and authors to follow</li>
                            <li>
                              Implemented user-specific follow tracking for personalized content
                            </li>
                          </ul>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">01/29/25</div>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                            <li>Publish flow as dropdown</li>
                            <li>Bounty creation via publish menu (UX only)</li>
                            <li>Improved UX for "Submit your Research" option</li>
                            <li>
                              Remove "About", "Explore" and "My ResearchCoin" from left sidebar
                            </li>
                            <li>Add "My ResearchCoin" option to topbar next to notifications</li>
                            <li>Render topics and metadata in work pages sidebar</li>
                            <li>Render PDF as HTML via pdfjs</li>
                          </ul>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">01/27/25</div>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                            <li>Fetching user organizations and notes in Lab notebook</li>
                            <li>Organization switcher component</li>
                            <li>Display private, public notes in different sections</li>
                          </ul>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">01/26/25</div>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                            <li>Funding page WIP which fetches content from API dynamically</li>
                          </ul>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">01/20/25</div>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                            <li>Auto code formatting with eslint and prettier libraries</li>
                            <li>Funding UX w/optional NFT rewards</li>
                            <li>Initial Publish workflow</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
