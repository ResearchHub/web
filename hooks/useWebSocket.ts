'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  WebSocketService,
  WebSocketStatus,
  getWebSocketInstance,
  createWebSocketInstance,
} from '@/services/websocket.service';

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
  connectAttemptLimit?: number;
  authRequired?: boolean;
  global?: boolean;
}

export function useWebSocket({
  url,
  autoConnect = true,
  autoReconnect = true,
  connectAttemptLimit = 5,
  authRequired = false,
  global = false,
}: UseWebSocketOptions) {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.Disconnected);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [wsInstance, setWsInstance] = useState<WebSocketService | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    let ws: WebSocketService;

    if (global) {
      // Use or create global instance
      ws = getWebSocketInstance({
        url,
        autoReconnect,
        connectAttemptLimit,
        authRequired,
        onStatusChange: setStatus,
        onError: setError,
      }) as WebSocketService;
    } else {
      // Create a new instance
      ws = createWebSocketInstance({
        url,
        autoReconnect,
        connectAttemptLimit,
        authRequired,
        onStatusChange: setStatus,
        onError: setError,
      });
    }

    setWsInstance(ws);

    // Set up message handler
    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };
    ws.on('message', handleMessage);

    // Connect if autoConnect is true
    if (autoConnect) {
      ws.connect();
    }

    // Cleanup
    return () => {
      if (!global) {
        ws.close();
      }
      ws.removeListener('message', handleMessage);
    };
  }, [url, autoConnect, autoReconnect, connectAttemptLimit, authRequired, global]);

  // Send message function
  const sendMessage = useCallback(
    (data: any) => {
      if (wsInstance) {
        wsInstance.send(data);
      }
    },
    [wsInstance]
  );

  // Connect function
  const connect = useCallback(() => {
    if (wsInstance) {
      wsInstance.connect();
    }
  }, [wsInstance]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (wsInstance) {
      wsInstance.close();
    }
  }, [wsInstance]);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (wsInstance) {
      wsInstance.reconnect();
    }
  }, [wsInstance]);

  // Clear messages function
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    status,
    messages,
    error,
    sendMessage,
    connect,
    disconnect,
    reconnect,
    clearMessages,
    instance: wsInstance,
  };
}
