'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Loader } from '@/components/ui/Loader';
import { AuthService } from '@/services/auth.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/pro-light-svg-icons';
import { Button } from '@/components/ui/Button';

type VerificationStatus = 'FETCHING' | 'VERIFIED' | 'ERROR';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('FETCHING');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyAndSignIn = async () => {
      try {
        if (!params.key) {
          setStatus('ERROR');
          setErrorMessage('Invalid verification key');
          return;
        }

        const key = decodeURIComponent(Array.isArray(params.key) ? params.key[0] : params.key);
        const res = await AuthService.verifyEmail(key);
        if (res?.key) {
          await signIn('credentials', {
            authToken: res.key,
            redirect: false,
          });
          setStatus('VERIFIED');
          router.replace('/');
        } else {
          // Do not show an error.
          // Show a success message indicating the email is already verified.
          // Allow the user to log in manually.
          setStatus('VERIFIED');
        }
      } catch (err: any) {
        setStatus('ERROR');
        setErrorMessage(err.message || 'Verification failed.');
      }
    };
    verifyAndSignIn();
  }, [params.key, router]);

  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-gray-100">
          {status === 'FETCHING' && (
            <>
              <Loader size="lg" className="mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Verifying Email…</h1>
              <p className="text-gray-500">
                Please wait while we verify your email and sign you in.
              </p>
            </>
          )}
          {status === 'VERIFIED' && (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-4xl mb-2" />
              <h1 className="text-xl font-semibold mb-2">Email Verified!</h1>
            </>
          )}
          {status === 'ERROR' && (
            <>
              <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600 text-4xl mb-2" />
              <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
              <p className="text-gray-500 mb-4">{errorMessage}</p>
              <Button className="w-full h-12" onClick={() => router.replace('/auth/signin')}>
                Go to Login
              </Button>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
