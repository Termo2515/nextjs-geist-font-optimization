/**
 * Data export/import functionality for CREAMI system
 * Supports multiple formats: JSON, CSV, and backup management
 */

import { StorageService, type ArticleData } from './storage';

export interface ExportOptions {
  format: 'json' | 'csv' | 'backup';
  filename?: string;
  includeSettings?: boolean;
  filter?: {
    category?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export class DataExportService {
  /**
   * Export articles to CSV format
   */
  static exportToCSV(articles: ArticleData[], filename: string = 'cremai-listino.csv'): void {
    try {
      const headers = [
        'Categoria',
        'Codice Articolo',
        'Descrizione',
        'Unità di Misura',
        'Prezzo (€)',
        'Note',
        'Data Inserimento'
      ];

      const rows = articles.map(article => [
        article.categoria,
        article.codArt || '',
        article.descrizione,
        article.um,
        article.prezzo.toFixed(2),
        article.note || '',
        article.dataInserimento
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export CSV');
    }
  }

  /**
   * Create a comprehensive backup
   */
  static createComprehensiveBackup(articles: ArticleData[]): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cremai-backup-${timestamp}.json`;
    
    StorageService.exportToJSON(articles, filename);
    StorageService.createBackup(articles, StorageService.loadSettings());
  }

  /**
   * Restore from backup file
   */
  static async restoreFromBackup(file: File): Promise<{
    success: boolean;
    articles: ArticleData[];
    message: string;
  }> {
    try {
      const articles = await StorageService.importFromJSON(file);
      
      if (!Array.isArray(articles)) {
        return {
          success: false,
          articles: [],
          message: 'Invalid data format in backup file'
        };
      }

      StorageService.saveArticles(articles);
      
      return {
        success: true,
        articles,
        message: `Successfully restored ${articles.length} articles`
      };
    } catch (error) {
      return {
        success: false,
        articles: [],
        message: error instanceof Error ? error.message : 'Failed to restore backup'
      };
    }
  }

  /**
   * Get export statistics
   */
  static getExportStats(articles: ArticleData[]): {
    totalArticles: number;
    categories: string[];
    dateRange: {
      earliest: Date | null;
      latest: Date | null;
    };
    averagePrice: number;
  } {
    if (articles.length === 0) {
      return {
        totalArticles: 0,
        categories: [],
        dateRange: { earliest: null, latest: null },
        averagePrice: 0
      };
    }

    const categories = [...new Set(articles.map(a => a.categoria))];
    const prices = articles.map(a => a.prezzo);
    const dates = articles.map(a => new Date(a.dataInserimento));

    return {
      totalArticles: articles.length,
      categories,
      dateRange: {
        earliest: new Date(Math.min(...dates.map(d => d.getTime()))),
        latest: new Date(Math.max(...dates.map(d => d.getTime())))
      },
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };
  }
}
