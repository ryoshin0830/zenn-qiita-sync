import { ZennClient } from './zenn-client.js';
import { QiitaClient } from './qiita-client.js';
import { FrontmatterConverter } from './converter.js';
import { SyncStorage } from './storage.js';
import chalk from 'chalk';
import ora from 'ora';

export class SyncService {
  /**
   * Post a Zenn article to both platforms
   */
  static async postArticle(zennSlug: string): Promise<void> {
    const spinner = ora('Posting article to both platforms...').start();
    
    try {
      // Read Zenn article
      spinner.text = 'Reading Zenn article...';
      const zennContent = await ZennClient.readArticle(zennSlug);
      
      // Check if already synced
      const existingQiitaId = await SyncStorage.getQiitaId(zennSlug);
      
      // Create Qiita version
      spinner.text = 'Converting to Qiita format...';
      const qiitaContent = FrontmatterConverter.createQiitaArticle(
        zennContent,
        existingQiitaId
      );
      
      // Save Qiita article
      const qiitaFilename = zennSlug;
      await QiitaClient.createArticle(qiitaFilename, qiitaContent);
      
      // Publish to Qiita
      spinner.text = 'Publishing to Qiita...';
      const qiitaId = await QiitaClient.publish(qiitaFilename, !!existingQiitaId);
      
      // Update sync mapping
      await SyncStorage.updateMapping(zennSlug, qiitaId);
      
      spinner.succeed(chalk.green('Successfully posted to both platforms!'));
      console.log(chalk.blue(`Zenn: articles/${zennSlug}.md`));
      if (qiitaId) {
        console.log(chalk.blue(`Qiita: https://qiita.com/items/${qiitaId}`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to post article'));
      throw error;
    }
  }

  /**
   * Sync all Zenn articles to Qiita
   */
  static async syncAll(): Promise<void> {
    const spinner = ora('Syncing all articles...').start();
    
    try {
      // Get all Zenn articles
      spinner.text = 'Getting Zenn articles...';
      const zennArticles = await ZennClient.getAllArticles();
      
      if (zennArticles.length === 0) {
        spinner.info('No Zenn articles found');
        return;
      }
      
      console.log(chalk.blue(`Found ${zennArticles.length} Zenn articles`));
      
      // Process each article
      for (const article of zennArticles) {
        spinner.text = `Processing ${article.slug}...`;
        
        try {
          await this.postArticle(article.slug);
        } catch (error) {
          console.error(chalk.red(`Failed to sync ${article.slug}:`), error);
        }
      }
      
      spinner.succeed(chalk.green('Sync completed!'));
    } catch (error) {
      spinner.fail(chalk.red('Sync failed'));
      throw error;
    }
  }

  /**
   * Create a new article on both platforms
   */
  static async createNewArticle(options: {
    title: string;
    emoji?: string;
    type?: 'tech' | 'idea';
    topics?: string[];
  }): Promise<void> {
    const spinner = ora('Creating new article...').start();
    
    try {
      // Create Zenn article
      spinner.text = 'Creating Zenn article...';
      const slug = await ZennClient.createArticle({
        title: options.title,
        emoji: options.emoji,
        type: options.type,
        topics: options.topics,
        published: true  // Always publish to Zenn
      });
      
      console.log(chalk.green(`Created Zenn article: ${slug}`));
      
      // Optionally post to Qiita immediately
      const shouldPost = true; // You can make this configurable
      if (shouldPost) {
        spinner.text = 'Posting to Qiita...';
        await this.postArticle(slug);
      }
      
      spinner.succeed(chalk.green('Article created successfully!'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create article'));
      throw error;
    }
  }

  /**
   * Pull changes from Qiita and update Zenn articles
   */
  static async pullFromQiita(): Promise<void> {
    const spinner = ora('Pulling from Qiita...').start();
    
    try {
      // Pull latest from Qiita
      spinner.text = 'Pulling articles from Qiita...';
      await QiitaClient.pull();
      
      // Get all Qiita articles
      const qiitaArticles = await QiitaClient.getAllArticles();
      const syncMapping = await SyncStorage.loadMapping();
      
      // Find articles to update in Zenn
      for (const qiitaArticle of qiitaArticles) {
        if (!qiitaArticle.id) continue;
        
        // Find corresponding Zenn article
        const zennSlug = Object.keys(syncMapping).find(
          slug => syncMapping[slug].qiitaId === qiitaArticle.id
        );
        
        if (zennSlug) {
          spinner.text = `Updating ${zennSlug} from Qiita...`;
          
          try {
            const zennContent = await ZennClient.readArticle(zennSlug);
            const updatedContent = FrontmatterConverter.updateZennFromQiita(
              zennContent,
              qiitaArticle.content
            );
            
            // Note: You'll need to implement a write method in ZennClient
            // For now, we'll just log the update
            console.log(chalk.yellow(`Would update ${zennSlug} (not implemented)`));
          } catch (error) {
            console.error(chalk.red(`Failed to update ${zennSlug}:`), error);
          }
        }
      }
      
      spinner.succeed(chalk.green('Pull completed!'));
    } catch (error) {
      spinner.fail(chalk.red('Pull failed'));
      throw error;
    }
  }
}