export interface PostResult {
    qiitaUrl?: string;
}
export interface SyncResult {
    total: number;
    success: number;
    failed: number;
    skipped: number;
}
export interface PullResult {
    count: number;
}
export interface PreviewResult {
    url: string;
    process?: any;
}
export declare class ZennQiitaSyncService {
    private previewProcesses;
    /**
     * Initialize both Zenn and Qiita CLIs
     */
    initialize(): Promise<void>;
    /**
     * Post a Zenn article to both platforms
     */
    postArticle(zennSlug: string, updateIfExists?: boolean): Promise<PostResult>;
    /**
     * Sync all Zenn articles to Qiita
     */
    syncAllArticles(forceUpdate?: boolean): Promise<SyncResult>;
    /**
     * Pull articles from Qiita
     */
    pullArticles(platform?: 'qiita' | 'both'): Promise<PullResult>;
    /**
     * Start preview server
     */
    startPreview(platform: 'zenn' | 'qiita'): Promise<PreviewResult>;
    /**
     * Get sync mapping
     */
    getSyncMapping(): Promise<Record<string, any>>;
    /**
     * Publish Zenn articles by committing and pushing to Git
     */
    publishZennArticles(commitMessage?: string, push?: boolean): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=sync-service.d.ts.map