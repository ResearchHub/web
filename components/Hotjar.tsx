'use client';

import Script from 'next/script';

/**
 * Hotjar analytics component for tracking user behavior, heatmaps, and session recordings.
 * Only loads in production environment when NEXT_PUBLIC_HOTJAR_ID is configured.
 */
const Hotjar = () => {
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction || !hotjarId) {
    return null;
  }

  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
};

export default Hotjar;
