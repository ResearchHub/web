'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
// import PersonaReact from 'persona-react';
import { PersonaVerificationSkeleton } from '@/components/skeletons/PersonaVerificationSkeleton';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WS_ROUTES } from '@/services/websocket';
import { transformNotification } from '@/types/notification';
import dynamic from 'next/dynamic';
const PersonaReact = dynamic(() => import('persona-react'), {
  ssr: false,
});

export interface VerificationWithPersonaStepProps {
  onVerificationStatusChange?: (status: 'success' | 'failed') => void;
}

export function VerificationWithPersonaStep({
  onVerificationStatusChange,
}: VerificationWithPersonaStepProps): JSX.Element {
  const [isPersonaLoaded, setIsPersonaLoaded] = useState(false);
  const { user } = useUser();
  const personaWrapperRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket for verification status updates
  const { messages } = useWebSocket({
    url: user?.id ? WS_ROUTES.NOTIFICATIONS(user.id) : '',
    authRequired: true,
    autoConnect: !!user?.id,
    global: true,
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const latestNotification = transformNotification(latestMessage);

      if (latestNotification.type === 'IDENTITY_VERIFICATION_UPDATED') {
        console.log('latestNotification', latestNotification);
        console.log('latestNotification.raw', latestNotification.raw);
        console.log('status', latestNotification.raw?.extra?.status);
        if (latestNotification.raw?.data?.extra?.status === 'APPROVED') {
          onVerificationStatusChange?.('success');
        } else {
          onVerificationStatusChange?.('failed');
        }
      }
    }
  }, [messages, onVerificationStatusChange]);

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
        />
      </div>
    </div>
  );
}
