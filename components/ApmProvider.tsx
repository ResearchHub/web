'use client';

import { useEffect } from 'react';
import { initElasticApm } from '@/lib/apm';

/**
 * This provider initializes the Elastic APM for performance monitoring.
 */
export default function ApmProvider() {
  useEffect(() => {
    initElasticApm();
  }, []);

  return null;
}
