'use client';

import { use } from 'react';
import { AssistantSession } from '@/components/Assistant/AssistantSession';

export default function AssistantSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  return <AssistantSession sessionId={sessionId} />;
}
