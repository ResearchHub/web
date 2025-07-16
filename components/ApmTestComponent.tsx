'use client';

import { apm } from '@elastic/apm-rum';
import { useState } from 'react';

/**
 * Test component to verify APM is working
 * Add this component temporarily to any page to test APM
 */
export function ApmTestComponent() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testTransaction = () => {
    try {
      const transaction = apm.startTransaction('manual-test-transaction', 'custom');
      if (transaction) {
        // Simulate some work
        setTimeout(() => {
          transaction.end();
          addResult('✅ Manual transaction sent successfully');
        }, 100);
      } else {
        addResult('❌ Failed to start transaction - APM may not be initialized');
      }
    } catch (error) {
      addResult(`❌ Transaction error: ${error}`);
    }
  };

  const testError = () => {
    try {
      apm.captureError(new Error('Test error from APM test component'));
      addResult('✅ Test error sent successfully');
    } catch (error) {
      addResult(`❌ Error capture failed: ${error}`);
    }
  };

  const testSpan = () => {
    try {
      const span = apm.startSpan('test-span', 'custom');
      if (span) {
        setTimeout(() => {
          span.end();
          addResult('✅ Test span sent successfully');
        }, 50);
      } else {
        addResult('❌ Failed to start span');
      }
    } catch (error) {
      addResult(`❌ Span error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '2px solid #333',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 9999,
        maxWidth: '400px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>APM Test Component</h3>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={testTransaction} style={{ marginRight: '5px', padding: '5px 10px' }}>
          Test Transaction
        </button>
        <button onClick={testError} style={{ marginRight: '5px', padding: '5px 10px' }}>
          Test Error
        </button>
        <button onClick={testSpan} style={{ marginRight: '5px', padding: '5px 10px' }}>
          Test Span
        </button>
        <button onClick={clearResults} style={{ padding: '5px 10px' }}>
          Clear
        </button>
      </div>

      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
        }}
      >
        {testResults.length === 0 ? (
          <div style={{ color: '#666' }}>No test results yet. Click buttons above to test APM.</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
