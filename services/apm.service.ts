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

  apm.init({
    environment: environment,
    serviceName: serviceName,
    serverUrl: serverUrl,
    transactionSampleRate: 0.1,
  });
}
