export declare class SyncService {
    /**
     * Post a Zenn article to both platforms
     */
    static postArticle(zennSlug: string): Promise<void>;
    /**
     * Sync all Zenn articles to Qiita
     */
    static syncAll(): Promise<void>;
    /**
     * Create a new article on both platforms
     */
    static createNewArticle(options: {
        title: string;
        emoji?: string;
        type?: 'tech' | 'idea';
        topics?: string[];
    }): Promise<string>;
    /**
     * Pull changes from Qiita and update Zenn articles
     */
    static pullFromQiita(): Promise<void>;
}
//# sourceMappingURL=sync-service.d.ts.map