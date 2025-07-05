'use client';

import { useEffect } from 'react';
import { initElasticApm } from '@/services/apm.service';

/**
 * This provider initializes the Elastic APM for performance monitoring.
 */
export default function ApmProvider() {
  useEffect(() => {
    initElasticApm();
  }, []);

  return null;
}
