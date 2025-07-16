'use client';

import { apm } from '@elastic/apm-rum';
import { useEffect, useState } from 'react';

interface ApmDiagnosticInfo {
  isInitialized: boolean;
  config: any;
  serverUrl?: string;
  serviceName?: string;
  environment?: string;
  errors: string[];
}

export function ApmDiagnostics() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<ApmDiagnosticInfo>({
    isInitialized: false,
    config: {},
    errors: [],
  });

  useEffect(() => {
    const checkApmStatus = () => {
      const errors: string[] = [];

      // Check if APM is initialized
      const isInitialized = !!(apm as any).serviceFactory;

      if (!isInitialized) {
        errors.push('APM is not initialized');
      }

      // Check environment variables
      const serverUrl = process.env.NEXT_PUBLIC_ELASTIC_APM_SERVER_URL;
      const serviceName = process.env.NEXT_PUBLIC_ELASTIC_APM_SERVICE_NAME;
      const environment = process.env.NEXT_PUBLIC_ENV;

      if (!serverUrl) {
        errors.push('NEXT_PUBLIC_ELASTIC_APM_SERVER_URL is not set');
      }

      // Try to get APM config
      let config = {};
      try {
        if (isInitialized && (apm as any).serviceFactory) {
          const configService = (apm as any).serviceFactory.getService('ConfigService');
          if (configService) {
            config = configService.config || {};
          }
        }
      } catch (e) {
        errors.push(`Failed to retrieve APM config: ${e}`);
      }

      // Test APM server connectivity
      if (serverUrl && isInitialized) {
        // Create a test transaction
        const testTransaction = apm.startTransaction('diagnostics-test', 'custom');
        if (testTransaction) {
          testTransaction.end();
          console.log('APM Diagnostics: Test transaction created');
        } else {
          errors.push('Failed to create test transaction');
        }

        // Test error capture
        try {
          apm.captureError(new Error('APM Diagnostics Test Error - This is intentional'));
          console.log('APM Diagnostics: Test error captured');
        } catch (e) {
          errors.push(`Failed to capture test error: ${e}`);
        }
      }

      setDiagnosticInfo({
        isInitialized,
        config,
        serverUrl: serverUrl || 'Not set',
        serviceName: serviceName || 'Not set',
        environment: environment || 'Not set',
        errors,
      });
    };

    // Run diagnostics after a short delay to ensure APM is initialized
    setTimeout(checkApmStatus, 1000);
  }, []);

  // Show diagnostics based on environment and errors
  const showDiagnostics =
    process.env.NEXT_PUBLIC_ENV !== 'production' ||
    diagnosticInfo.errors.length > 0 ||
    (typeof window !== 'undefined' && window.location.search.includes('apm-debug=true'));

  if (!showDiagnostics) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: diagnosticInfo.errors.length > 0 ? '#fee' : '#efe',
        border: `2px solid ${diagnosticInfo.errors.length > 0 ? '#f00' : '#0f0'}`,
        padding: '15px',
        borderRadius: '8px',
        zIndex: 9999,
        maxWidth: '500px',
        fontFamily: 'monospace',
        fontSize: '11px',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>APM Diagnostics</h3>

      <div style={{ marginBottom: '5px' }}>
        <strong>Status:</strong>{' '}
        {diagnosticInfo.isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Server URL:</strong> {diagnosticInfo.serverUrl}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Service Name:</strong> {diagnosticInfo.serviceName}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Environment:</strong> {diagnosticInfo.environment}
      </div>

      {diagnosticInfo.errors.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Errors:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {diagnosticInfo.errors.map((error, index) => (
              <li key={index} style={{ color: 'red' }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(diagnosticInfo.config).length > 0 && (
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer' }}>Config Details</summary>
          <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(diagnosticInfo.config, null, 2)}
          </pre>
        </details>
      )}

      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        Check browser console for APM logs. This diagnostic will send a test transaction and error.
      </div>
    </div>
  );
}
