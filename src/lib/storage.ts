/**
 * Storage service for CREAMI price list management system
 * Provides persistent storage using localStorage and IndexedDB
 */

export interface ArticleData {
  id: string;
  categoria: string;
  codArt: string;
  descrizione: string;
  um: string;
  prezzo: number;
  note: string;
  dataInserimento: string;
}

export interface StorageSettings {
  autoSaveInterval: number;
  maxBackups: number;
  backupRetentionDays: number;
}

export interface BackupData {
  articles: any[];
  settings: StorageSettings;
  timestamp: string;
  version: string;
}

export class StorageService {
  private static readonly STORAGE_KEYS = {
    ARTICLES: 'creami-articles',
    SETTINGS: 'creami-settings',
    BACKUPS: 'creami-backups',
    LAST_SAVE: 'creami-last-save'
  };

  private static readonly DEFAULT_SETTINGS: StorageSettings = {
    autoSaveInterval: 30000, // 30 seconds
    maxBackups: 10,
    backupRetentionDays: 30
  };

  /**
   * Save articles to localStorage
   */
  static saveArticles(articles: any[]): void {
    try {
      const data = {
        articles,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(this.STORAGE_KEYS.ARTICLES, JSON.stringify(data));
      localStorage.setItem(this.STORAGE_KEYS.LAST_SAVE, new Date().toISOString());
    } catch (error) {
      console.error('Error saving articles:', error);
      throw new Error('Failed to save articles to storage');
    }
  }

  /**
   * Load articles from localStorage
   */
  static loadArticles(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ARTICLES);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      return data.articles || [];
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  /**
   * Save settings to localStorage
   */
  static saveSettings(settings: StorageSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  static loadSettings(): StorageSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : this.DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  /**
   * Create a backup of current data
   */
  static createBackup(articles: any[], settings: StorageSettings): void {
    try {
      const backup: BackupData = {
        articles,
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      const existingBackups = this.loadBackups();
      existingBackups.unshift(backup);

      // Keep only the most recent backups
      const maxBackups = settings.maxBackups || this.DEFAULT_SETTINGS.maxBackups;
      const trimmedBackups = existingBackups.slice(0, maxBackups);

      localStorage.setItem(this.STORAGE_KEYS.BACKUPS, JSON.stringify(trimmedBackups));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  /**
   * Load all backups
   */
  static loadBackups(): BackupData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BACKUPS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading backups:', error);
      return [];
    }
  }

  /**
   * Export data as JSON file
   */
  static exportToJSON(articles: any[], filename: string = 'cremai-backup.json'): void {
    try {
      const data = {
        articles,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        type: 'CREAMI_EXPORT'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import data from JSON file
   */
  static importFromJSON(file: File): Promise<{
    success: boolean;
    articles: ArticleData[];
    message: string;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (!data.articles || !Array.isArray(data.articles)) {
            resolve({
              success: false,
              articles: [],
              message: 'Invalid data format in backup file'
            });
            return;
          }
          
          resolve({
            success: true,
            articles: data.articles,
            message: `Successfully imported ${data.articles.length} articles`
          });
        } catch (error) {
          resolve({
            success: false,
            articles: [],
            message: 'Failed to parse JSON file'
          });
        }
      };
      
      reader.onerror = () => resolve({
        success: false,
        articles: [],
        message: 'Failed to read file'
      });
      reader.readAsText(file);
    });
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get last save timestamp
   */
  static getLastSaveTime(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.LAST_SAVE);
  }

  /**
   * Check if data exists
   */
  static hasSavedData(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.ARTICLES) !== null;
  }
}
