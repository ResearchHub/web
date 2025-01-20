'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

interface GrantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GrantInfo {
  title: string;
  description: string;
  amount: number;
}

export function GrantModal({ isOpen, onClose }: GrantModalProps) {
  const [grantInfo, setGrantInfo] = useState<GrantInfo>({
    title: '',
    description: '',
    amount: 10000, // Minimum 10,000 RSC
  });
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // TODO: Implement grant submission
    router.push('/grants');
    onClose();
  };

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Submit a Grant</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Fund promising research by publishing a Request for Proposals (RFP)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={grantInfo.title}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setGrantInfo({ ...grantInfo, title: e.target.value })
                        }
                        placeholder="Enter grant title"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={grantInfo.description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          setGrantInfo({ ...grantInfo, description: e.target.value })
                        }
                        placeholder="Describe the research you want to fund..."
                        rows={5}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Grant Amount (RSC)
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min={10000}
                        value={grantInfo.amount}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setGrantInfo({ ...grantInfo, amount: Number(e.target.value) })
                        }
                        placeholder="Enter grant amount in ResearchCoin"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum grant amount is 10,000 RSC
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Grant Process</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Applications are reviewed on a rolling basis</li>
                      <li>• Decisions are made monthly</li>
                      <li>• Selected proposals will be announced publicly</li>
                      <li>• Monthly progress updates are required</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full justify-center">
                    Submit Grant
                  </Button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
