'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
// import PersonaReact from 'persona-react';
import { PersonaVerificationSkeleton } from '@/components/skeletons/PersonaVerificationSkeleton';

import dynamic from 'next/dynamic';
const PersonaReact = dynamic(() => import('persona-react'), {
  ssr: false,
});

export interface VerificationWithPersonaStepProps {
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export function VerificationWithPersonaStep({
  onComplete,
  onError,
}: VerificationWithPersonaStepProps): JSX.Element {
  const [isPersonaLoaded, setIsPersonaLoaded] = useState(false);
  const { user } = useUser();
  const personaWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyIframeStyles = () => {
      if (!personaWrapperRef.current) {
        return;
      }

      const iframe = personaWrapperRef.current.querySelector('iframe');
      if (iframe) {
        iframe.style.minHeight = '650px';
        iframe.style.minWidth = '400px';
        iframe.style.width = '100%';
      }
    };

    if (isPersonaLoaded) {
      applyIframeStyles();
    }
  }, [isPersonaLoaded]);

  if (!user) {
    return <div className="text-center py-4">Loading user information...</div>;
  }

  return (
    <div ref={personaWrapperRef} className="w-full">
      {!isPersonaLoaded && (
        <div className="p-6">
          <PersonaVerificationSkeleton />
        </div>
      )}
      <div className={isPersonaLoaded ? '' : 'hidden'}>
        <PersonaReact
          environmentId={process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID}
          templateId={process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID}
          referenceId={`${user.id}`}
          fields={{
            nameFirst: user.firstName || '',
            nameLast: user.lastName || '',
          }}
          onReady={() => {
            setIsPersonaLoaded(true);
          }}
          onComplete={({ inquiryId, status, fields }) => {
            console.log('Persona verification completed:', inquiryId);
            onComplete?.();
          }}
          onError={(error: any) => {
            console.error('Persona verification error:', error);
            onError?.(error);
          }}
        />
      </div>
    </div>
  );
}
