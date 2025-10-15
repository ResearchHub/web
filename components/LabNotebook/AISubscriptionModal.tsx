'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAISubscription } from '@/hooks/useAISubscription';

interface AISubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISubscriptionModal({ isOpen, onClose }: AISubscriptionModalProps) {
  const { subscription, isLoading, error, createCheckout, cancel } = useAISubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await createCheckout();
    } catch (err) {
      console.error('Failed to create checkout:', err);
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your premium subscription?')) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancel();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const isPremium = subscription?.plan === 'PREMIUM';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black !bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-2">
                  AI Assistant Plans
                </Dialog.Title>

                <p className="text-sm text-gray-600 mb-6">
                  Choose the plan that best fits your research needs
                </p>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error.message}</p>
                  </div>
                )}

                {/* Current Plan Badge */}
                {subscription && (
                  <div className="mb-6 inline-block">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isPremium ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      Current Plan: {subscription.plan}
                    </span>
                  </div>
                )}

                {/* Plans Comparison */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Free Plan */}
                  <div
                    className={`border-2 rounded-lg p-6 ${
                      !isPremium ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Free</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">
                      $0<span className="text-base font-normal text-gray-600">/month</span>
                    </p>

                    <ul className="space-y-3 mb-6">
                      <FeatureItem>3 completions per day</FeatureItem>
                      <FeatureItem>3 chat messages per day</FeatureItem>
                      <FeatureItem>Citation search</FeatureItem>
                      <FeatureItem>Basic support</FeatureItem>
                    </ul>

                    {!isPremium && (
                      <div className="text-sm text-blue-600 font-medium">Current Plan</div>
                    )}
                  </div>

                  {/* Premium Plan */}
                  <div
                    className={`border-2 rounded-lg p-6 ${
                      isPremium ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">Premium</h4>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                        POPULAR
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-4">
                      $9.99<span className="text-base font-normal text-gray-600">/month</span>
                    </p>

                    <ul className="space-y-3 mb-6">
                      <FeatureItem>Unlimited completions</FeatureItem>
                      <FeatureItem>Unlimited chat messages</FeatureItem>
                      <FeatureItem>Advanced citation search</FeatureItem>
                      <FeatureItem>Priority support</FeatureItem>
                      <FeatureItem>Early access to new features</FeatureItem>
                    </ul>

                    {isPremium ? (
                      <div className="text-sm text-blue-600 font-medium">Current Plan</div>
                    ) : (
                      <Button
                        onClick={handleUpgrade}
                        disabled={isLoading || isUpgrading}
                        className="w-full"
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Upgrade to Premium'
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Cancellation for premium users */}
                {isPremium && subscription.status === 'active' && (
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      Your premium subscription will renew on{' '}
                      {subscription.current_period_end
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-6">
                  Note: Payment processing requires Stripe configuration. Contact support if you
                  encounter any issues.
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-gray-700">{children}</span>
    </li>
  );
}
