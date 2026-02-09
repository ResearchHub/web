'use client';

import { useEffect } from 'react';
import ClaritySDK from '@microsoft/clarity';

let isInitialized = false;

/**
 * Microsoft Clarity analytics component for session recordings, heatmaps, and user behavior.
 * Only loads in production when NEXT_PUBLIC_CLARITY_ID is configured.
 */
const Clarity = () => {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!isInitialized && isProduction && clarityId) {
      ClaritySDK.init(clarityId);
      isInitialized = true;
    }
  }, [clarityId, isProduction]);

  return null;
};

export default Clarity;
