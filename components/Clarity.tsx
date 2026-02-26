'use client';

import { useEffect, useRef } from 'react';
import ClaritySDK from '@microsoft/clarity';

const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Microsoft Clarity analytics component for session recordings, heatmaps, and user behavior.
 */
const Clarity = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current && isProduction && clarityId) {
      ClaritySDK.init(clarityId);
      isInitialized.current = true;
    }
  }, []);

  return null;
};

export default Clarity;
