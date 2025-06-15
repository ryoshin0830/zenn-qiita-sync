export declare class QiitaClient {
    private static readonly PUBLIC_DIR;
    private static readonly CREDENTIALS_PATH;
    /**
     * Check if Qiita CLI is authenticated
     */
    static isAuthenticated(): Promise<boolean>;
    /**
     * Authenticate with Qiita CLI
     */
    static authenticate(): Promise<void>;
    /**
     * Initialize Qiita directory
     */
    static init(): Promise<void>;
    /**
     * Create a new Qiita article
     */
    static createArticle(filename: string, content: string): Promise<void>;
    /**
     * Publish article to Qiita
     */
    static publish(filename: string, force?: boolean): Promise<string | null>;
    /**
     * Pull articles from Qiita
     */
    static pull(force?: boolean): Promise<void>;
    /**
     * Get all Qiita articles
     */
    static getAllArticles(): Promise<Array<{
        filename: string;
        content: string;
        id: string | null;
    }>>;
    /**
     * Preview Qiita articles locally
     */
    static preview(): void;
}
//# sourceMappingURL=qiita-client.d.ts.map