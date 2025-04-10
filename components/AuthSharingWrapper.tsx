'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AuthSharingService } from '@/services/auth-sharing.service';
import { Loader2 } from 'lucide-react';

export function AuthSharingWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkSharedToken = async () => {
      // Only check if we're not authenticated
      if (status === 'unauthenticated') {
        const sharedToken = AuthSharingService.getSharedAuthToken();

        if (sharedToken) {
          setIsChecking(true);
          await signIn('credentials', {
            authToken: sharedToken,
            redirect: false,
          });
          AuthSharingService.removeSharedAuthToken();
          setIsChecking(false);
        }
      }
    };

    checkSharedToken();
  }, [status]);

  useEffect(() => {
    if (session?.authToken) {
      AuthSharingService.setSharedAuthToken(session.authToken);
    }
  }, [session?.authToken]);

  return (
    <>
      {children}

      <Transition show={isChecking} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center shadow-xl transition-all">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      Authorizing...
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      We found your existing session. Signing you in automatically...
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
