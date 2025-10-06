'use client';

import { useEffect, useState, useRef } from 'react';

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: string;
}

/**
 * Mobile Debug Console - displays console logs on screen for mobile debugging
 * TODO: Remove this component after mobile debugging is complete
 */
export function MobileDebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show on mobile devices
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setLogs((prev) => [
        ...prev.slice(-50), // Keep last 50 logs
        {
          id: logIdRef.current++,
          type,
          message,
          timestamp,
        },
      ]);
    };

    console.log = (...args: any[]) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    // Auto-scroll to bottom when new logs appear
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [logs]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] bg-black/95 text-white rounded-lg shadow-2xl border border-gray-700"
      style={{ width: isMinimized ? 'auto' : '90vw', maxWidth: '500px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <span className="text-xs font-mono font-bold">🐛 Debug Console</span>
        <div className="flex gap-2">
          <button
            onClick={() => setLogs([])}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div className="overflow-y-auto max-h-[50vh] p-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">No logs yet...</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`mb-1 pb-1 border-b border-gray-800 ${
                  log.type === 'error'
                    ? 'text-red-400'
                    : log.type === 'warn'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }`}
              >
                <span className="text-gray-500 mr-2">{log.timestamp}</span>
                <span
                  className={`mr-2 font-bold ${
                    log.type === 'error'
                      ? 'text-red-500'
                      : log.type === 'warn'
                        ? 'text-yellow-500'
                        : 'text-blue-500'
                  }`}
                >
                  [{log.type.toUpperCase()}]
                </span>
                <pre className="whitespace-pre-wrap break-all inline">{log.message}</pre>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
