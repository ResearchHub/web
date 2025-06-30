'use client';

import { useEffect } from 'react';
import AmplitudeService from '@/services/amplitude.service';

const AmplitudeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    AmplitudeService.init();
  }, []);

  return <>{children}</>;
};

export default AmplitudeProvider;
