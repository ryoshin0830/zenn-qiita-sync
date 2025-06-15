export interface CreateArticleParams {
    title: string;
    emoji?: string;
    type?: 'tech' | 'idea';
    published?: boolean;
    topics?: string[];
    interactive?: boolean;
}
export interface CreateArticleResult {
    slug: string;
    path: string;
}
export interface EditArticleParams {
    slug: string;
    content?: string;
    title?: string;
    emoji?: string;
    type?: 'tech' | 'idea';
    published?: boolean;
    topics?: string[];
}
export interface ArticleContent {
    slug: string;
    title: string;
    content: string;
    frontmatter: any;
    path: string;
}
export interface ArticleInfo {
    slug: string;
    title: string;
    emoji?: string;
    type?: string;
    topics?: string[];
    published?: boolean;
    syncStatus: 'synced' | 'not-synced' | 'out-of-sync';
    qiitaId?: string;
    zennUrl?: string;
    qiitaUrl?: string;
}
export declare class ArticleService {
    private syncService;
    constructor(syncService: any);
    /**
     * Create a new article
     */
    createArticle(params: CreateArticleParams): Promise<CreateArticleResult>;
    /**
     * List all articles with their sync status
     */
    listArticles(): Promise<ArticleInfo[]>;
    /**
     * Get article content
     */
    getArticle(slug: string): Promise<ArticleContent>;
    /**
     * Edit article content and/or metadata
     */
    editArticle(params: EditArticleParams): Promise<ArticleContent>;
    /**
     * Delete an article
     */
    deleteArticle(slug: string): Promise<void>;
}
//# sourceMappingURL=article-service.d.ts.map