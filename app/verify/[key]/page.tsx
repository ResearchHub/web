'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/pro-solid-svg-icons';

type VerificationStatus = 'FETCHING' | 'VERIFIED' | 'ERROR';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('FETCHING');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyEmail = async () => {
    try {
      if (!params.key) {
        setStatus('ERROR');
        setErrorMessage('Invalid verification key');
        return;
      }

      const key = Array.isArray(params.key) ? params.key[0] : params.key;
      const decodedKey = decodeURIComponent(key);
      console.log('key', decodedKey);
      const res = await AuthService.verifyEmail(decodedKey);
      console.log('res', res);
      setStatus('VERIFIED');
    } catch (error: any) {
      setStatus('ERROR');
      setErrorMessage(error.message || 'Link expired or email already verified');
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [params.key]);

  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md rounded-lg p-8 flex flex-col items-center justify-center space-y-6 mt-12 border border-gray-100 shadow-sm">
          {status === 'FETCHING' && (
            <>
              <Loader size="lg" className="text-primary-600" />
              <h1 className="text-2xl font-medium text-center text-gray-800">Verifying...</h1>
            </>
          )}

          {status === 'VERIFIED' && (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-medium text-center text-green-600">Email verified</h1>
              <Alert variant="success" className="w-full">
                Your email has been successfully verified.
              </Alert>
              <div className="w-full">
                <Link href="/login">
                  <Button className="w-full h-12">Login to ResearchHub</Button>
                </Link>
              </div>
            </>
          )}

          {status === 'ERROR' && (
            <>
              <FontAwesomeIcon icon={faExclamationCircle} className="h-16 w-16 text-orange-600" />
              <h1 className="text-2xl font-medium text-center text-orange-600">
                Verification failed
              </h1>
              <Alert variant="error" className="w-full">
                {errorMessage || 'Link expired or email already verified.'}
              </Alert>
              <div className="w-full">
                <Link href="/login">
                  <Button className="w-full h-12">Login to ResearchHub</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
