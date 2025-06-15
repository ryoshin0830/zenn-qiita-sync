import { execSync } from 'child_process';
import { readFile, readdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { FrontmatterConverter } from './converter.js';
import { execInProjectRoot, getProjectRoot } from '../utils/cli.js';

export class ZennClient {
  private static readonly ARTICLES_DIR = path.join(getProjectRoot(), 'articles');

  /**
   * Initialize Zenn CLI in the project
   */
  static async init(): Promise<void> {
    try {
      if (!existsSync(this.ARTICLES_DIR)) {
        // Remove console output to avoid JSON parse errors in MCP
        execInProjectRoot('zenn init', { stdio: 'pipe' });
      }
    } catch (error) {
      // console.error(chalk.red('Failed to initialize Zenn CLI:'), error);
      throw error;
    }
  }

  /**
   * Create a new Zenn article
   */
  static async createArticle(options?: {
    slug?: string;
    title?: string;
    type?: 'tech' | 'idea';
    emoji?: string;
    topics?: string[];
    published?: boolean;
  }): Promise<string> {
    try {
      let command = 'zenn new:article';
      
      if (options?.slug) {
        command += ` --slug ${options.slug}`;
      }
      if (options?.title) {
        command += ` --title "${options.title}"`;
      }
      if (options?.type) {
        command += ` --type ${options.type}`;
      }
      if (options?.emoji) {
        command += ` --emoji ${options.emoji}`;
      }

      const output = execInProjectRoot(command, { encoding: 'utf-8' }) as string;
      
      // Extract the created file path from output
      const match = output.match(/articles\/(.+)\.md/);
      if (match) {
        const slug = match[1];
        
        // If topics are provided, update the article
        if (options?.topics && options.topics.length > 0) {
          await this.updateArticleTopics(slug, options.topics);
        }
        
        // Set published status if provided
        if (options?.published !== undefined) {
          await this.updateArticlePublishedStatus(slug, options.published);
        }
        
        return slug;
      }
      
      throw new Error('Failed to extract article slug from output');
    } catch (error) {
      // console.error(chalk.red('Failed to create Zenn article:'), error);
      throw error;
    }
  }

  /**
   * Update article topics
   */
  static async updateArticleTopics(slug: string, topics: string[]): Promise<void> {
    try {
      const filePath = path.join(this.ARTICLES_DIR, `${slug}.md`);
      const content = await readFile(filePath, 'utf-8');
      
      const { data, content: body } = FrontmatterConverter.parseMarkdown(content);
      data.topics = topics.slice(0, 5); // Zenn allows max 5 topics
      
      const updatedContent = FrontmatterConverter.stringifyMarkdown(data, body);
      await writeFile(filePath, updatedContent);
    } catch (error) {
      // console.error(chalk.red('Failed to update article topics:'), error);
      throw error;
    }
  }

  /**
   * Update article published status
   */
  static async updateArticlePublishedStatus(slug: string, published: boolean): Promise<void> {
    try {
      const filePath = path.join(this.ARTICLES_DIR, `${slug}.md`);
      const content = await readFile(filePath, 'utf-8');
      
      const { data, content: body } = FrontmatterConverter.parseMarkdown(content);
      data.published = published;
      
      const updatedContent = FrontmatterConverter.stringifyMarkdown(data, body);
      await writeFile(filePath, updatedContent);
    } catch (error) {
      // console.error(chalk.red('Failed to update article published status:'), error);
      throw error;
    }
  }

  /**
   * Get all Zenn articles
   */
  static async getAllArticles(): Promise<Array<{ slug: string; content: string }>> {
    try {
      if (!existsSync(this.ARTICLES_DIR)) {
        return [];
      }

      const files = await readdir(this.ARTICLES_DIR);
      const articles = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const slug = file.replace('.md', '');
          const content = await readFile(
            path.join(this.ARTICLES_DIR, file),
            'utf-8'
          );
          articles.push({ slug, content });
        }
      }

      return articles;
    } catch (error) {
      // console.error(chalk.red('Failed to get Zenn articles:'), error);
      throw error;
    }
  }

  /**
   * Read a specific Zenn article
   */
  static async readArticle(slug: string): Promise<string> {
    try {
      const filePath = path.join(this.ARTICLES_DIR, `${slug}.md`);
      return await readFile(filePath, 'utf-8');
    } catch (error) {
      // console.error(chalk.red(`Failed to read Zenn article ${slug}:`), error);
      throw error;
    }
  }

  /**
   * Preview Zenn articles locally
   */
  static preview(): void {
    // console.log(chalk.blue('Starting Zenn preview server...'));
    // console.log(chalk.gray('Press Ctrl+C to stop'));
    execInProjectRoot('zenn preview', { stdio: 'inherit' });
  }
}