#!/usr/bin/env node
import { Command } from 'commander';
import { config } from 'dotenv';
import chalk from 'chalk';
import { ZennClient } from './lib/zenn-client.js';
import { QiitaClient } from './lib/qiita-client.js';
import { SyncService } from './lib/sync-service.js';

// Load environment variables
config();

const program = new Command();

program
  .name('zenn-qiita-sync')
  .description('Sync articles between Zenn and Qiita')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize Zenn and Qiita CLI')
  .action(async () => {
    try {
      console.log(chalk.blue('Initializing...'));
      
      // Initialize Zenn
      await ZennClient.init();
      
      // Check Qiita authentication
      if (!await QiitaClient.isAuthenticated()) {
        console.log(chalk.yellow('Qiita authentication required'));
        await QiitaClient.authenticate();
      }
      
      await QiitaClient.init();
      
      console.log(chalk.green('Initialization complete!'));
    } catch (error) {
      console.error(chalk.red('Initialization failed:'), error);
      process.exit(1);
    }
  });

// Post command
program
  .command('post <slug>')
  .description('Post a Zenn article to both platforms')
  .action(async (slug: string) => {
    try {
      // Check authentication
      if (!await QiitaClient.isAuthenticated()) {
        console.log(chalk.yellow('Please run "init" first to authenticate'));
        process.exit(1);
      }
      
      await SyncService.postArticle(slug);
    } catch (error) {
      console.error(chalk.red('Post failed:'), error);
      process.exit(1);
    }
  });

// Sync command
program
  .command('sync')
  .description('Sync all Zenn articles to Qiita')
  .action(async () => {
    try {
      // Check authentication
      if (!await QiitaClient.isAuthenticated()) {
        console.log(chalk.yellow('Please run "init" first to authenticate'));
        process.exit(1);
      }
      
      await SyncService.syncAll();
    } catch (error) {
      console.error(chalk.red('Sync failed:'), error);
      process.exit(1);
    }
  });

// New command
program
  .command('new')
  .description('Create a new article on both platforms')
  .option('-t, --title <title>', 'Article title')
  .option('-e, --emoji <emoji>', 'Emoji for Zenn', '📝')
  .option('--type <type>', 'Article type (tech/idea)', 'tech')
  .option('--topics <topics>', 'Comma-separated topics')
  .action(async (options) => {
    try {
      if (!options.title) {
        console.error(chalk.red('Title is required'));
        process.exit(1);
      }
      
      // Check authentication
      if (!await QiitaClient.isAuthenticated()) {
        console.log(chalk.yellow('Please run "init" first to authenticate'));
        process.exit(1);
      }
      
      const topics = options.topics ? options.topics.split(',').map((t: string) => t.trim()) : [];
      
      await SyncService.createNewArticle({
        title: options.title,
        emoji: options.emoji,
        type: options.type,
        topics
      });
    } catch (error) {
      console.error(chalk.red('Create failed:'), error);
      process.exit(1);
    }
  });

// Pull command
program
  .command('pull')
  .description('Pull changes from Qiita')
  .option('-f, --force', 'Force pull, overwriting local changes')
  .action(async (options) => {
    try {
      // Check authentication
      if (!await QiitaClient.isAuthenticated()) {
        console.log(chalk.yellow('Please run "init" first to authenticate'));
        process.exit(1);
      }
      
      await SyncService.pullFromQiita();
    } catch (error) {
      console.error(chalk.red('Pull failed:'), error);
      process.exit(1);
    }
  });

// Preview commands
program
  .command('preview:zenn')
  .description('Preview Zenn articles locally')
  .action(() => {
    ZennClient.preview();
  });

program
  .command('preview:qiita')
  .description('Preview Qiita articles locally')
  .action(() => {
    QiitaClient.preview();
  });

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);