import matter from 'gray-matter';
export class FrontmatterConverter {
    /**
     * Convert Zenn frontmatter to Qiita frontmatter
     */
    static zennToQiita(zennFrontmatter, existingQiitaId) {
        return {
            title: zennFrontmatter.title,
            tags: zennFrontmatter.topics,
            private: false, // Always publish to Qiita as public
            updated_at: new Date().toISOString(),
            id: existingQiitaId || null,
            organization_url_name: process.env.QIITA_ORGANIZATION || null,
            slide: false,
            ignorePublish: false
        };
    }
    /**
     * Convert Qiita frontmatter to Zenn frontmatter
     */
    static qiitaToZenn(qiitaFrontmatter, existingEmoji) {
        return {
            title: qiitaFrontmatter.title,
            emoji: existingEmoji || '📝',
            type: 'tech',
            topics: qiitaFrontmatter.tags.slice(0, 5), // Zenn max 5 topics
            published: !qiitaFrontmatter.private,
            published_at: qiitaFrontmatter.updated_at
        };
    }
    /**
     * Parse markdown content and extract frontmatter
     */
    static parseMarkdown(content) {
        return matter(content);
    }
    /**
     * Stringify frontmatter and content back to markdown
     */
    static stringifyMarkdown(data, content) {
        return matter.stringify(content, data);
    }
    /**
     * Create Qiita version of the article
     */
    static createQiitaArticle(zennContent, existingQiitaId) {
        const { data, content } = this.parseMarkdown(zennContent);
        const zennFrontmatter = data;
        const qiitaFrontmatter = this.zennToQiita(zennFrontmatter, existingQiitaId);
        return this.stringifyMarkdown(qiitaFrontmatter, content);
    }
    /**
     * Update Zenn article from Qiita changes (for sync purposes)
     */
    static updateZennFromQiita(zennContent, qiitaContent) {
        const zennParsed = this.parseMarkdown(zennContent);
        const qiitaParsed = this.parseMarkdown(qiitaContent);
        const zennData = zennParsed.data;
        const qiitaData = qiitaParsed.data;
        // Update only title and content, preserve Zenn-specific fields
        zennData.title = qiitaData.title;
        return this.stringifyMarkdown(zennData, qiitaParsed.content);
    }
}
//# sourceMappingURL=converter.js.map