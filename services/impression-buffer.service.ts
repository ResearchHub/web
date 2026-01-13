import AnalyticsService, { LogEvent } from './analytics.service';
import { FeedSource } from '@/types/analytics';
import { DeviceType } from '@/hooks/useDeviceType';

interface ImpressionItem {
  unifiedDocumentId: string;
  contentType: string;
  feedPosition: number;
  recommendationId?: string | null;
}

interface ImpressionContext {
  feedSource: FeedSource;
  feedTab: string;
  feedOrdering?: string;
  deviceType: DeviceType;
}

class ImpressionBufferService {
  private buffer: ImpressionItem[] = [];
  private seenIds = new Set<string>();
  private context: ImpressionContext | null = null;
  private flushTimeout: NodeJS.Timeout | null = null;

  private readonly BUFFER_SIZE_THRESHOLD = 15;
  private readonly FLUSH_DELAY_MS = 3000;

  setContext(context: ImpressionContext) {
    this.context = context;
  }

  trackImpression(item: ImpressionItem) {
    if (this.seenIds.has(item.unifiedDocumentId)) {
      return;
    }

    this.seenIds.add(item.unifiedDocumentId);
    this.buffer.push(item);

    // Reset debounce timer
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    this.flushTimeout = setTimeout(() => this.flush(), this.FLUSH_DELAY_MS);

    // Flush immediately if buffer is full
    if (this.buffer.length >= this.BUFFER_SIZE_THRESHOLD) {
      this.flush();
    }
  }

  flush() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.buffer.length === 0 || !this.context) {
      return;
    }

    const impressions = [...this.buffer];
    this.buffer = [];

    AnalyticsService.logEvent(LogEvent.BULK_FEED_IMPRESSION, {
      device_type: this.context.deviceType,
      feed_source: this.context.feedSource,
      feed_tab: this.context.feedTab,
      feed_ordering: this.context.feedOrdering,
      impression_count: impressions.length,
      impressions,
    });
  }

  reset() {
    this.buffer = [];
    this.seenIds.clear();
  }

  // Debug utility - expose to window for manual testing
  getDebugInfo() {
    return {
      bufferSize: this.buffer.length,
      seenCount: this.seenIds.size,
      context: this.context,
      buffer: this.buffer,
    };
  }
}

const impressionBufferService = new ImpressionBufferService();

// Expose debug utilities to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).impressionDebug = {
    flush: () => impressionBufferService.flush(),
    reset: () => impressionBufferService.reset(),
    info: () => impressionBufferService.getDebugInfo(),
  };
}

export default impressionBufferService;
