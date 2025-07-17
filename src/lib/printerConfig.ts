export interface PrinterConfig {
  id: string;
  name: string;
  paperSize: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale: number;
  showHeaders: boolean;
  showFooters: boolean;
  includeDate: boolean;
  includePageNumbers: boolean;
}

export class PrinterConfigService {
  private static readonly STORAGE_KEY = 'printer-config';
  private static readonly DEFAULT_CONFIG: PrinterConfig = {
    id: 'default',
    name: 'Stampante Predefinita',
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    scale: 100,
    showHeaders: true,
    showFooters: true,
    includeDate: true,
    includePageNumbers: true,
  };

  static getConfig(): PrinterConfig {
    if (typeof window === 'undefined') return this.DEFAULT_CONFIG;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return { ...this.DEFAULT_CONFIG, ...JSON.parse(stored) };
      } catch {
        return this.DEFAULT_CONFIG;
      }
    }
    return this.DEFAULT_CONFIG;
  }

  static saveConfig(config: Partial<PrinterConfig>): void {
    if (typeof window === 'undefined') return;
    
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static resetConfig(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_CONFIG));
  }

  static getPrintStyles(config: PrinterConfig): string {
    const { paperSize, orientation, margins, scale } = config;
    
    const paperSizes = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
      Legal: { width: 216, height: 356 },
      A3: { width: 297, height: 420 },
    };

    const size = paperSizes[paperSize];
    const isPortrait = orientation === 'portrait';
    
    return `
      @media print {
        @page {
          size: ${paperSize} ${orientation};
          margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
        }
        
        body {
          transform: scale(${scale / 100});
          transform-origin: top left;
          width: ${isPortrait ? size.width : size.height}mm;
        }
        
        .no-print {
          display: none !important;
        }
        
        .print-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          z-index: 1000;
          padding: 10px;
          border-bottom: 1px solid #ccc;
        }
        
        .print-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          z-index: 1000;
          padding: 10px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 12px;
        }
        
        .print-content {
          margin-top: 60px;
          margin-bottom: 60px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .page-break {
          page-break-before: always;
        }
      }
    `;
  }
}
