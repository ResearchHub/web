declare module 'pdfjs-dist/webpack' {
  export const getDocument: any;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
}

declare module 'pdfjs-dist/build/pdf.mjs' {
  export function renderTextLayer(options: {
    textContent: any;
    container: HTMLDivElement;
    viewport: any;
    textDivs: any[];
  }): Promise<void>;
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
      renderInteractiveForms?: boolean;
    });
    setPdfPage(page: any): void;
    draw(): Promise<void>;
    update(options: { scale: number }): void;
  }

  export class TextLayerBuilder {
    constructor(options: { textLayerDiv: HTMLDivElement; pageIndex: number; viewport: any });
    setTextContent(textContent: any): void;
    render(): void;
  }
}
