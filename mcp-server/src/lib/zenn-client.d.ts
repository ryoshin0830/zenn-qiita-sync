export declare class ZennClient {
    private static readonly ARTICLES_DIR;
    /**
     * Initialize Zenn CLI in the project
     */
    static init(): Promise<void>;
    /**
     * Create a new Zenn article
     */
    static createArticle(options?: {
        slug?: string;
        title?: string;
        type?: 'tech' | 'idea';
        emoji?: string;
        topics?: string[];
        published?: boolean;
    }): Promise<string>;
    /**
     * Update article topics
     */
    static updateArticleTopics(slug: string, topics: string[]): Promise<void>;
    /**
     * Update article published status
     */
    static updateArticlePublishedStatus(slug: string, published: boolean): Promise<void>;
    /**
     * Get all Zenn articles
     */
    static getAllArticles(): Promise<Array<{
        slug: string;
        content: string;
    }>>;
    /**
     * Read a specific Zenn article
     */
    static readArticle(slug: string): Promise<string>;
    /**
     * Preview Zenn articles locally
     */
    static preview(): void;
}
//# sourceMappingURL=zenn-client.d.ts.map