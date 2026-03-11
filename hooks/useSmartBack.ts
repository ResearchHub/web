'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SPECIAL_ROUTES = ['/proposal/', '/grant/', '/post/', '/paper/', '/author/', '/question/'];

export const useSmartBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const currentPathBase = pathname.split('/').slice(0, 3).join('/');
      const newPathBase = url.split('/').slice(0, 3).join('/');

      if (currentPathBase !== newPathBase) {
        setPreviousRoute(pathname);
      }
    };

    const originalPush = router.push;
    router.push = (...args) => {
      handleRouteChange(args[0].toString());
      return originalPush.apply(router, args);
    };

    return () => {
      router.push = originalPush;
    };
  }, [pathname, router]);

  const goBack = () => {
    if (window.history.length <= 1) {
      router.push('/');
      return;
    }

    const isSpecialRoute = SPECIAL_ROUTES.some((route) => pathname.startsWith(route));

    if (isSpecialRoute && previousRoute && previousRoute !== pathname) {
      router.push(previousRoute);
    } else {
      router.back();
    }
  };

  return goBack;
};
