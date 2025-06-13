import { execSync } from 'child_process';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

export class ZennClient {
  private static readonly ARTICLES_DIR = './articles';

  /**
   * Initialize Zenn CLI in the project
   */
  static async init(): Promise<void> {
    try {
      if (!existsSync(this.ARTICLES_DIR)) {
        console.log(chalk.blue('Initializing Zenn CLI...'));
        execSync('npx zenn init', { stdio: 'inherit' });
      }
    } catch (error) {
      console.error(chalk.red('Failed to initialize Zenn CLI:'), error);
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
  }): Promise<string> {
    try {
      let command = 'npx zenn new:article';
      
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

      const output = execSync(command, { encoding: 'utf-8' });
      
      // Extract the created file path from output
      const match = output.match(/articles\/(.+)\.md/);
      if (match) {
        return match[1]; // Return slug
      }
      
      throw new Error('Failed to extract article slug from output');
    } catch (error) {
      console.error(chalk.red('Failed to create Zenn article:'), error);
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
      console.error(chalk.red('Failed to get Zenn articles:'), error);
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
      console.error(chalk.red(`Failed to read Zenn article ${slug}:`), error);
      throw error;
    }
  }

  /**
   * Preview Zenn articles locally
   */
  static preview(): void {
    console.log(chalk.blue('Starting Zenn preview server...'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
    execSync('npx zenn preview', { stdio: 'inherit' });
  }
}