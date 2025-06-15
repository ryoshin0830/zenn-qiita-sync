interface SyncMapping {
    zennSlug: string;
    qiitaId: string | null;
    lastSyncedAt: string;
}
export declare class SyncStorage {
    private static readonly STORAGE_PATH;
    /**
     * Load sync mapping from storage
     */
    static loadMapping(): Promise<Record<string, SyncMapping>>;
    /**
     * Save sync mapping to storage
     */
    static saveMapping(mapping: Record<string, SyncMapping>): Promise<void>;
    /**
     * Get Qiita ID for a Zenn article
     */
    static getQiitaId(zennSlug: string): Promise<string | null>;
    /**
     * Update mapping for an article
     */
    static updateMapping(zennSlug: string, qiitaId: string | null): Promise<void>;
}
export {};
//# sourceMappingURL=storage.d.ts.map