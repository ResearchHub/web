'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Mail, HelpCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { colors } from '@/app/styles/colors';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('hello@researchhub.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
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
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    Contact ResearchHub
                  </Dialog.Title>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* General Contact */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ backgroundColor: `${colors.rhBlue[500]}15` }}
                      >
                        <Mail className="w-5 h-5" style={{ color: colors.rhBlue[500] }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        General Questions
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Have a question about ResearchHub? We'd love to help!
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: colors.rhBlue[500] }}>
                          hello@researchhub.com
                        </span>
                        <button
                          onClick={copyEmailToClipboard}
                          className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors"
                          title={copied ? 'Copied!' : 'Copy email address'}
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                          )}
                        </button>
                        {copied && (
                          <span className="text-xs text-green-600 font-medium">Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Technical Support */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ backgroundColor: `${colors.rhBlue[500]}15` }}
                      >
                        <HelpCircle className="w-5 h-5" style={{ color: colors.rhBlue[500] }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Technical Support
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Experiencing technical issues? Submit a support request for faster
                        assistance.
                      </p>
                      <a
                        href="https://github.com/ResearchHub/issues/issues/new/choose"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium hover:opacity-80"
                        style={{ color: colors.rhBlue[500] }}
                      >
                        Submit Support Request
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">
                      <strong>Response time:</strong> We typically respond to general inquiries
                      within 24-48 hours. For technical issues, please use our support system for
                      faster resolution.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outlined" onClick={onClose} className="px-4 py-2">
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
