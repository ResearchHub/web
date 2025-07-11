'use client';

import { useEffect } from 'react';
import AnalyticsService from '@/services/analytics.service';

const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    AnalyticsService.init();
  }, []);

  return <>{children}</>;
};

export default AnalyticsProvider;
