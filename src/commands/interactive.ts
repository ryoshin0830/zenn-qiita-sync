import inquirer from 'inquirer';
import { SyncService } from '../lib/sync-service.js';
import chalk from 'chalk';

export async function interactiveNew() {
  console.log(chalk.blue('📝 新しい記事を作成します\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: '記事のタイトルを入力してください:',
      validate: (input) => input.length > 0 || 'タイトルは必須です'
    },
    {
      type: 'input',
      name: 'emoji',
      message: '絵文字を入力してください (例: 🚀):',
      default: '📝'
    },
    {
      type: 'list',
      name: 'type',
      message: '記事のタイプを選択してください:',
      choices: [
        { name: '技術記事 (tech)', value: 'tech' },
        { name: 'アイデア記事 (idea)', value: 'idea' }
      ],
      default: 'tech'
    },
    {
      type: 'input',
      name: 'topics',
      message: 'タグを入力してください (カンマ区切り、最大5個):',
      default: '',
      filter: (input) => input.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }
  ]);

  try {
    await SyncService.createNewArticle({
      title: answers.title,
      emoji: answers.emoji,
      type: answers.type,
      topics: answers.topics
    });
  } catch (error) {
    console.error(chalk.red('記事の作成に失敗しました:'), error);
    process.exit(1);
  }
}