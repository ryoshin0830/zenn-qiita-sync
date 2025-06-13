import matter from 'gray-matter';
import { ZennFrontmatter, QiitaFrontmatter } from '../types/index.js';

export class FrontmatterConverter {
  /**
   * Convert Zenn frontmatter to Qiita frontmatter
   */
  static zennToQiita(
    zennFrontmatter: ZennFrontmatter,
    existingQiitaId?: string | null
  ): QiitaFrontmatter {
    return {
      title: zennFrontmatter.title,
      tags: zennFrontmatter.topics,
      private: !zennFrontmatter.published,
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
  static qiitaToZenn(
    qiitaFrontmatter: QiitaFrontmatter,
    existingEmoji?: string
  ): ZennFrontmatter {
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
  static parseMarkdown(content: string): {
    data: any;
    content: string;
  } {
    return matter(content);
  }

  /**
   * Stringify frontmatter and content back to markdown
   */
  static stringifyMarkdown(data: any, content: string): string {
    return matter.stringify(content, data);
  }

  /**
   * Create Qiita version of the article
   */
  static createQiitaArticle(
    zennContent: string,
    existingQiitaId?: string | null
  ): string {
    const { data, content } = this.parseMarkdown(zennContent);
    const zennFrontmatter = data as ZennFrontmatter;
    
    const qiitaFrontmatter = this.zennToQiita(zennFrontmatter, existingQiitaId);
    
    return this.stringifyMarkdown(qiitaFrontmatter, content);
  }

  /**
   * Update Zenn article from Qiita changes (for sync purposes)
   */
  static updateZennFromQiita(
    zennContent: string,
    qiitaContent: string
  ): string {
    const zennParsed = this.parseMarkdown(zennContent);
    const qiitaParsed = this.parseMarkdown(qiitaContent);
    
    const zennData = zennParsed.data as ZennFrontmatter;
    const qiitaData = qiitaParsed.data as QiitaFrontmatter;
    
    // Update only title and content, preserve Zenn-specific fields
    zennData.title = qiitaData.title;
    
    return this.stringifyMarkdown(zennData, qiitaParsed.content);
  }
}