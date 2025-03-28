import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { EventEmitter } from 'events';

export enum WebSocketStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
}

export interface WebSocketOptions {
  url: string;
  autoReconnect?: boolean;
  connectAttemptLimit?: number;
  authRequired?: boolean;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
  onError?: (error: Error) => void;
}

const ALLOWED_ORIGINS = [
  'localhost',
  'localhost:8000',
  'ws://localhost:8000',
  'ws://localhost:8000/',
  'backend.prod.researchhub.com',
  'wss://backend.prod.researchhub.com',
  'backend.staging.researchhub.com',
  'wss://backend.staging.researchhub.com',
  'v2.staging.researchhub.com',
  'wss://v2.staging.researchhub.com',
  'researchhub.com',
  'wss://researchhub.com',
];

const CLOSE_CODES = {
  GOING_AWAY: 1001,
  POLICY_VIOLATION: 1008,
};

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private autoReconnect: boolean;
  private connectAttemptLimit: number;
  private connectAttempts: number = 0;
  private authRequired: boolean;
  private status: WebSocketStatus = WebSocketStatus.Disconnected;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private stopped: boolean = false;

  constructor(options: WebSocketOptions) {
    super();
    this.url = options.url;
    this.autoReconnect = options.autoReconnect ?? true;
    this.connectAttemptLimit = options.connectAttemptLimit ?? 5;
    this.authRequired = options.authRequired ?? false;

    // Register event handlers if provided
    if (options.onMessage) {
      this.on('message', options.onMessage);
    }
    if (options.onStatusChange) {
      this.on('statusChange', options.onStatusChange);
    }
    if (options.onError) {
      this.on('error', options.onError);
    }
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    if (this.stopped) {
      return;
    }

    try {
      if (this.authRequired) {
        const token = await this.getAuthToken();
        if (!token) {
          throw new Error('Authentication required but no token available');
        }
        this.ws = new WebSocket(this.url, ['Token', token]);
      } else {
        this.ws = new WebSocket(this.url);
      }

      this.connectAttempts++;
      this.updateStatus(WebSocketStatus.Connecting);

      this.setupEventListeners();

      if (this.connectAttempts >= this.connectAttemptLimit) {
        this.stopped = true;
        this.close(CLOSE_CODES.GOING_AWAY, 'Exceeded connection attempt limit');
      }
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error('Failed to connect to WebSocket')
      );
      this.scheduleReconnect();
    }
  }

  /**
   * Send a message through the WebSocket
   * @param data - The data to send
   */
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.handleError(new Error('WebSocket is not connected'));
      return;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to send message'));
    }
  }

  /**
   * Close the WebSocket connection
   * @param code - The close code
   * @param reason - The reason for closing
   */
  close(code?: number, reason?: string): void {
    this.stopped = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close(code, reason);
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.ws = null;
    }

    this.updateStatus(WebSocketStatus.Disconnected);
  }

  /**
   * Get the current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Reset the connection state and attempt to reconnect
   */
  reconnect(): void {
    this.stopped = false;
    this.connectAttempts = 0;
    this.close(CLOSE_CODES.GOING_AWAY, 'Manual reconnect');
    this.connect();
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.updateStatus(WebSocketStatus.Connected);
      this.connectAttempts = 0; // Reset attempt counter on successful connection
    };

    this.ws.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        this.emit('message', data);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error('Failed to parse message'));
        this.emit('message', event.data); // Emit the raw data if parsing fails
      }
    };

    this.ws.onerror = (event) => {
      this.handleError(new Error('WebSocket error'));
      this.scheduleReconnect();
    };

    this.ws.onclose = (event) => {
      this.updateStatus(WebSocketStatus.Disconnected);
      this.ws = null;

      if (!this.stopped && this.autoReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.stopped || !this.autoReconnect) return;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Exponential backoff with a maximum of 30 seconds
    const delay = Math.min(1000 * Math.pow(2, this.connectAttempts), 30000);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private updateStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.emit('statusChange', status);
    }
  }

  private handleError(error: Error): void {
    this.updateStatus(WebSocketStatus.Error);
    this.emit('error', error);
    console.error('WebSocket error:', error);
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        // Server-side
        const session = await getServerSession(authOptions);
        return session?.authToken || null;
      } else {
        // Client-side
        const session = await getSession();
        return session?.authToken || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
}

// Create a singleton instance for global use
let globalWebSocketInstance: WebSocketService | null = null;

/**
 * Get or create a global WebSocket instance
 * @param options - WebSocket options (only used if creating a new instance)
 */
export function getWebSocketInstance(options?: WebSocketOptions): WebSocketService | null {
  if (!options && !globalWebSocketInstance) {
    return null;
  }

  if (!globalWebSocketInstance && options) {
    globalWebSocketInstance = new WebSocketService(options);
  }

  return globalWebSocketInstance;
}

/**
 * Create a new WebSocket instance
 * @param options - WebSocket options
 */
export function createWebSocketInstance(options: WebSocketOptions): WebSocketService {
  return new WebSocketService(options);
}
