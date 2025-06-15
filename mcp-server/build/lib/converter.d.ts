import { ZennFrontmatter, QiitaFrontmatter } from '../types/index.js';
export declare class FrontmatterConverter {
    /**
     * Convert Zenn frontmatter to Qiita frontmatter
     */
    static zennToQiita(zennFrontmatter: ZennFrontmatter, existingQiitaId?: string | null): QiitaFrontmatter;
    /**
     * Convert Qiita frontmatter to Zenn frontmatter
     */
    static qiitaToZenn(qiitaFrontmatter: QiitaFrontmatter, existingEmoji?: string): ZennFrontmatter;
    /**
     * Parse markdown content and extract frontmatter
     */
    static parseMarkdown(content: string): {
        data: any;
        content: string;
    };
    /**
     * Stringify frontmatter and content back to markdown
     */
    static stringifyMarkdown(data: any, content: string): string;
    /**
     * Create Qiita version of the article
     */
    static createQiitaArticle(zennContent: string, existingQiitaId?: string | null): string;
    /**
     * Update Zenn article from Qiita changes (for sync purposes)
     */
    static updateZennFromQiita(zennContent: string, qiitaContent: string): string;
}
//# sourceMappingURL=converter.d.ts.map