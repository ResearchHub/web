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
      console.log('[AuthSharing] Checking auth status:', {
        status,
        isChecking,
      });

      // Only check if we're not authenticated
      if (status === 'unauthenticated') {
        console.log('[AuthSharing] User is not authenticated, checking for shared token');
        const sharedToken = AuthSharingService.getSharedAuthToken();

        console.log('[AuthSharing] Shared token check result:', {
          hasToken: !!sharedToken,
          tokenPreview: sharedToken ? `${sharedToken.substring(0, 5)}...` : null,
        });

        if (sharedToken) {
          setIsChecking(true);
          console.log('[AuthSharing] Attempting to sign in with shared token');

          try {
            const result = await signIn('credentials', {
              authToken: sharedToken,
              redirect: false,
            });

            console.log('[AuthSharing] Sign in result:', {
              success: result?.ok,
              error: result?.error,
              status: result?.status,
            });

            AuthSharingService.removeSharedAuthToken();
          } catch (error) {
            console.error('[AuthSharing] Sign in failed:', error);
          } finally {
            setIsChecking(false);
          }
        }
      }
    };

    checkSharedToken();
  }, [status]);

  useEffect(() => {
    console.log('[AuthSharing] Session token check:', {
      hasSession: !!session,
      hasAuthToken: !!session?.authToken,
      tokenPreview: session?.authToken ? `${session.authToken.substring(0, 5)}...` : null,
    });

    if (session?.authToken) {
      console.log('[AuthSharing] Setting shared token from session');
      try {
        AuthSharingService.setSharedAuthToken(session.authToken);
        console.log('[AuthSharing] Successfully set shared token');
      } catch (error) {
        console.error('[AuthSharing] Failed to set shared token:', error);
      }
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
