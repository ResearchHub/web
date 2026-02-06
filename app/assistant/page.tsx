'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { OnboardingScreen } from '@/components/Assistant/OnboardingScreen';
import { AssistantService } from '@/services/assistant.service';
import type { AssistantRole } from '@/types/assistant';

export default function AssistantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = useCallback(
    async (role: AssistantRole) => {
      setIsLoading(true);
      try {
        const response = await AssistantService.chat({
          role,
          message: 'Hello, I want to get started.',
        });
        router.push(`/assistant/${response.session_id}`);
      } catch {
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <PageLayout rightSidebar={false}>
      <OnboardingScreen onSelectRole={handleSelectRole} isLoading={isLoading} />
    </PageLayout>
  );
}
