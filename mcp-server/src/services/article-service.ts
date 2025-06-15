import { ZennClient } from '../lib/zenn-client.js';
import { QiitaClient } from '../lib/qiita-client.js';
import { FrontmatterConverter } from '../lib/converter.js';
import { SyncStorage } from '../lib/storage.js';
import path from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { getProjectRoot } from '../utils/cli.js';

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

export class ArticleService {
  constructor(private syncService: any) {}

  /**
   * Create a new article
   */
  async createArticle(params: CreateArticleParams): Promise<CreateArticleResult> {
    // Create Zenn article
    const slug = await ZennClient.createArticle({
      title: params.title,
      emoji: params.emoji || '📝',
      type: params.type || 'tech',
      topics: params.topics || [],
      published: params.published ?? false,
    });
    
    return {
      slug,
      path: `articles/${slug}.md`,
    };
  }

  /**
   * List all articles with their sync status
   */
  async listArticles(): Promise<ArticleInfo[]> {
    const articles: ArticleInfo[] = [];
    const syncMapping = await SyncStorage.loadMapping();
    
    // Get Zenn articles
    const zennArticles = await ZennClient.getAllArticles();
    
    for (const zennArticle of zennArticles) {
      const { data } = FrontmatterConverter.parseMarkdown(zennArticle.content);
      const qiitaId = syncMapping[zennArticle.slug]?.qiitaId;
      
      articles.push({
        slug: zennArticle.slug,
        title: data.title || 'Untitled',
        emoji: data.emoji,
        type: data.type,
        topics: data.topics,
        published: data.published,
        syncStatus: qiitaId ? 'synced' : 'not-synced',
        qiitaId: qiitaId || undefined,
        zennUrl: undefined,
        qiitaUrl: qiitaId ? `https://qiita.com/items/${qiitaId}` : undefined,
      });
    }
    
    // Check for Qiita-only articles
    if (existsSync('./public')) {
      const qiitaArticles = await QiitaClient.getAllArticles();
      
      for (const qiitaArticle of qiitaArticles) {
        if (!qiitaArticle.id) continue;
        
        // Check if this Qiita article has a corresponding Zenn article
        const hasZennArticle = Object.values(syncMapping).some(
          mapping => mapping.qiitaId === qiitaArticle.id
        );
        
        if (!hasZennArticle) {
          const { data } = FrontmatterConverter.parseMarkdown(qiitaArticle.content);
          
          articles.push({
            slug: qiitaArticle.filename,
            title: data.title || 'Untitled',
            topics: data.tags?.map((tag: any) => typeof tag === 'string' ? tag : tag.name) || [],
            published: !data.private,
            syncStatus: 'out-of-sync',
            qiitaId: qiitaArticle.id,
            qiitaUrl: `https://qiita.com/items/${qiitaArticle.id}`,
          });
        }
      }
    }
    
    return articles;
  }

  /**
   * Get article content
   */
  async getArticle(slug: string): Promise<ArticleContent> {
    const articlePath = path.join(getProjectRoot(), 'articles', `${slug}.md`);
    
    if (!existsSync(articlePath)) {
      throw new Error(`Article not found: ${slug}`);
    }
    
    const content = await readFile(articlePath, 'utf-8');
    const { data: frontmatter, content: body } = FrontmatterConverter.parseMarkdown(content);
    
    return {
      slug,
      title: frontmatter.title || 'Untitled',
      content: body,
      frontmatter,
      path: `articles/${slug}.md`,
    };
  }

  /**
   * Edit article content and/or metadata
   */
  async editArticle(params: EditArticleParams): Promise<ArticleContent> {
    const articlePath = path.join(getProjectRoot(), 'articles', `${params.slug}.md`);
    
    if (!existsSync(articlePath)) {
      throw new Error(`Article not found: ${params.slug}`);
    }
    
    // Read current content
    const currentContent = await readFile(articlePath, 'utf-8');
    const { data: frontmatter, content: body } = FrontmatterConverter.parseMarkdown(currentContent);
    
    // Update frontmatter if provided
    if (params.title !== undefined) frontmatter.title = params.title;
    if (params.emoji !== undefined) frontmatter.emoji = params.emoji;
    if (params.type !== undefined) frontmatter.type = params.type;
    if (params.published !== undefined) frontmatter.published = params.published;
    if (params.topics !== undefined) frontmatter.topics = params.topics.slice(0, 5); // Zenn allows max 5 topics
    
    // Use new content if provided, otherwise keep existing
    const newBody = params.content !== undefined ? params.content : body;
    
    // Create updated content
    const updatedContent = FrontmatterConverter.stringifyMarkdown(frontmatter, newBody);
    
    // Write back to file
    await writeFile(articlePath, updatedContent);
    
    return {
      slug: params.slug,
      title: frontmatter.title || 'Untitled',
      content: newBody,
      frontmatter,
      path: `articles/${params.slug}.md`,
    };
  }

  /**
   * Delete an article
   */
  async deleteArticle(slug: string): Promise<void> {
    const articlePath = path.join(getProjectRoot(), 'articles', `${slug}.md`);
    
    if (!existsSync(articlePath)) {
      throw new Error(`Article not found: ${slug}`);
    }
    
    // Delete the file
    const { unlink } = await import('fs/promises');
    await unlink(articlePath);
    
    // Remove from sync mapping if exists
    const syncMapping = await SyncStorage.loadMapping();
    if (syncMapping[slug]) {
      delete syncMapping[slug];
      await SyncStorage.saveMapping(syncMapping);
    }
  }
}