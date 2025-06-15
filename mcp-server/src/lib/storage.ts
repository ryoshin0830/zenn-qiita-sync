import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getProjectRoot } from '../utils/cli.js';

interface SyncMapping {
  zennSlug: string;
  qiitaId: string | null;
  lastSyncedAt: string;
}

export class SyncStorage {
  private static readonly STORAGE_PATH = path.join(getProjectRoot(), '.config/sync-mapping.json');

  /**
   * Load sync mapping from storage
   */
  static async loadMapping(): Promise<Record<string, SyncMapping>> {
    try {
      if (!existsSync(this.STORAGE_PATH)) {
        return {};
      }
      const data = await readFile(this.STORAGE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load sync mapping:', error);
      return {};
    }
  }

  /**
   * Save sync mapping to storage
   */
  static async saveMapping(mapping: Record<string, SyncMapping>): Promise<void> {
    try {
      const dir = path.dirname(this.STORAGE_PATH);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(this.STORAGE_PATH, JSON.stringify(mapping, null, 2));
    } catch (error) {
      console.error('Failed to save sync mapping:', error);
      throw error;
    }
  }

  /**
   * Get Qiita ID for a Zenn article
   */
  static async getQiitaId(zennSlug: string): Promise<string | null> {
    const mapping = await this.loadMapping();
    return mapping[zennSlug]?.qiitaId || null;
  }

  /**
   * Update mapping for an article
   */
  static async updateMapping(
    zennSlug: string,
    qiitaId: string | null
  ): Promise<void> {
    const mapping = await this.loadMapping();
    mapping[zennSlug] = {
      zennSlug,
      qiitaId,
      lastSyncedAt: new Date().toISOString()
    };
    await this.saveMapping(mapping);
  }
}