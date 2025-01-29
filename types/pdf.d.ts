declare module 'pdfjs-dist/webpack' {
  export const getDocument: any;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
}

declare module 'pdfjs-dist/web/pdf_viewer' {
  export class EventBus {
    constructor();
  }

  export class PDFPageView {
    constructor(options: {
      container: HTMLDivElement;
      id: number;
      scale: number;
      defaultViewport: any;
      eventBus: EventBus;
      textLayerMode: number;
    });
    setPdfPage(page: any): void;
    draw(): Promise<void>;
    update(options: { scale: number }): void;
  }
} 