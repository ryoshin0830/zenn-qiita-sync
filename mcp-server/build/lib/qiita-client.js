import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { FrontmatterConverter } from './converter.js';
import { execInProjectRoot, getProjectRoot } from '../utils/cli.js';
export class QiitaClient {
    static PUBLIC_DIR = path.join(getProjectRoot(), 'public');
    static CREDENTIALS_PATH = `${process.env.HOME}/.config/qiita-cli/credentials.json`;
    /**
     * Check if Qiita CLI is authenticated
     */
    static async isAuthenticated() {
        try {
            if (process.env.QIITA_TOKEN) {
                return true;
            }
            return existsSync(this.CREDENTIALS_PATH);
        }
        catch {
            return false;
        }
    }
    /**
     * Authenticate with Qiita CLI
     */
    static async authenticate() {
        try {
            if (process.env.QIITA_TOKEN) {
                // Use environment variable token
                // console.log(chalk.blue('Using QIITA_TOKEN from environment'));
                // Create credentials file for Qiita CLI
                const credentialsDir = path.dirname(this.CREDENTIALS_PATH);
                if (!existsSync(credentialsDir)) {
                    await mkdir(credentialsDir, { recursive: true });
                }
                const credentials = {
                    token: process.env.QIITA_TOKEN,
                    organization: process.env.QIITA_ORGANIZATION || null
                };
                await writeFile(this.CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
            }
            else {
                // Interactive login
                // console.log(chalk.yellow('Please login to Qiita CLI'));
                execInProjectRoot('qiita login', { stdio: 'inherit' });
            }
        }
        catch (error) {
            // console.error(chalk.red('Failed to authenticate with Qiita:'), error);
            throw error;
        }
    }
    /**
     * Initialize Qiita directory
     */
    static async init() {
        try {
            if (!existsSync(this.PUBLIC_DIR)) {
                await mkdir(this.PUBLIC_DIR, { recursive: true });
            }
        }
        catch (error) {
            // console.error(chalk.red('Failed to initialize Qiita directory:'), error);
            throw error;
        }
    }
    /**
     * Create a new Qiita article
     */
    static async createArticle(filename, content) {
        try {
            await this.init();
            const filePath = path.join(this.PUBLIC_DIR, `${filename}.md`);
            await writeFile(filePath, content);
            // console.log(chalk.green(`Created Qiita article: ${filename}`));
        }
        catch (error) {
            // console.error(chalk.red('Failed to create Qiita article:'), error);
            throw error;
        }
    }
    /**
     * Publish article to Qiita
     */
    static async publish(filename, force = false) {
        try {
            const command = force
                ? `qiita publish ${filename} --force`
                : `qiita publish ${filename}`;
            const output = execInProjectRoot(command, { encoding: 'utf-8' });
            // console.log(chalk.green(`Published to Qiita: ${filename}`));
            // Try to extract article ID from the updated file
            const filePath = path.join(this.PUBLIC_DIR, `${filename}.md`);
            const content = await readFile(filePath, 'utf-8');
            const { data } = FrontmatterConverter.parseMarkdown(content);
            return data.id || null;
        }
        catch (error) {
            // console.error(chalk.red('Failed to publish to Qiita:'), error);
            throw error;
        }
    }
    /**
     * Pull articles from Qiita
     */
    static async pull(force = false) {
        try {
            const command = force
                ? 'qiita pull --force'
                : 'qiita pull';
            execInProjectRoot(command, { stdio: 'inherit' });
            // console.log(chalk.green('Pulled articles from Qiita'));
        }
        catch (error) {
            // console.error(chalk.red('Failed to pull from Qiita:'), error);
            throw error;
        }
    }
    /**
     * Get all Qiita articles
     */
    static async getAllArticles() {
        try {
            if (!existsSync(this.PUBLIC_DIR)) {
                return [];
            }
            const files = await readdir(this.PUBLIC_DIR);
            const articles = [];
            for (const file of files) {
                if (file.endsWith('.md')) {
                    const filename = file.replace('.md', '');
                    const content = await readFile(path.join(this.PUBLIC_DIR, file), 'utf-8');
                    const { data } = FrontmatterConverter.parseMarkdown(content);
                    articles.push({
                        filename,
                        content,
                        id: data.id || null
                    });
                }
            }
            return articles;
        }
        catch (error) {
            // console.error(chalk.red('Failed to get Qiita articles:'), error);
            throw error;
        }
    }
    /**
     * Preview Qiita articles locally
     */
    static preview() {
        // console.log(chalk.blue('Starting Qiita preview server...'));
        // console.log(chalk.gray('Press Ctrl+C to stop'));
        execInProjectRoot('qiita preview', { stdio: 'inherit' });
    }
}
//# sourceMappingURL=qiita-client.js.map