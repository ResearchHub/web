import { apm } from '@elastic/apm-rum';

export function initElasticApm() {
  const serverUrl = process.env.NEXT_PUBLIC_ELASTIC_APM_SERVER_URL;
  if (!serverUrl) {
    console.warn('Elastic APM server URL is not defined. APM will not be initialized.');
    return;
  }

  const environment = process.env.NEXT_PUBLIC_ENV || 'development';

  const serviceName =
    process.env.NEXT_PUBLIC_ELASTIC_APM_SERVICE_NAME || 'researchhub-development-web';

  try {
    const apmInstance = apm.init({
      environment: environment,
      serviceName: serviceName,
      serverUrl: serverUrl,
      // Log level for debugging
      logLevel: environment === 'production' ? 'warn' : 'debug',
      // Disable agent in development if needed
      active: true,
      // Add page load transaction name
      pageLoadTransactionName: window.location.pathname,
      // Distributed tracing
      distributedTracingOrigins: ['https://researchhub.com', 'https://*.vercel.app'],
      // Error threshold
      errorThrottleLimit: 20,
      errorThrottleInterval: 30000,
      // Transaction sample rate (1.0 = 100%)
      transactionSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Disable instrumenting certain requests
      ignoreTransactions: [
        // Ignore health checks and analytics
        /\/api\/health/,
        /google-analytics/,
        /analytics\.amplitude/,
      ],
      // Breakdown metrics
      breakdownMetrics: true,
    });

    // Log successful initialization
    console.log(
      `Elastic APM initialized successfully for ${serviceName} in ${environment} environment`
    );

    // Set initial user context if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        apm.setUserContext({
          id: userId,
        });
      }
    }

    // Add global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error caught by APM:', event.error);
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection caught by APM:', event.reason);
      apm.captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`));
    });

    return apmInstance;
  } catch (error) {
    console.error('Failed to initialize Elastic APM:', error);
    return null;
  }
}
