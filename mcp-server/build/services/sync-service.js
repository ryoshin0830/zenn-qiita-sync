import { execSync, spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
// Import utilities
import { ensureProjectRoot, getProjectRoot } from '../utils/cli.js';
// Load environment variables from project root
dotenv.config({ path: path.join(getProjectRoot(), '.env') });
// Ensure we're in the project root for CLI commands
ensureProjectRoot();
// Import utilities from local copy
import { ZennClient } from '../lib/zenn-client.js';
import { QiitaClient } from '../lib/qiita-client.js';
import { FrontmatterConverter } from '../lib/converter.js';
import { SyncStorage } from '../lib/storage.js';
export class ZennQiitaSyncService {
    previewProcesses = new Map();
    /**
     * Initialize both Zenn and Qiita CLIs
     */
    async initialize() {
        // Initialize Zenn
        await ZennClient.init();
        // Initialize and authenticate Qiita
        if (!await QiitaClient.isAuthenticated()) {
            await QiitaClient.authenticate();
        }
        await QiitaClient.init();
    }
    /**
     * Post a Zenn article to both platforms
     */
    async postArticle(zennSlug, updateIfExists = false) {
        // Read Zenn article
        const zennContent = await ZennClient.readArticle(zennSlug);
        // Check if already synced
        const existingQiitaId = await SyncStorage.getQiitaId(zennSlug);
        if (existingQiitaId && !updateIfExists) {
            throw new Error(`Article ${zennSlug} is already synced with Qiita ID: ${existingQiitaId}. Use updateIfExists: true to force update.`);
        }
        // Create Qiita version
        const qiitaContent = FrontmatterConverter.createQiitaArticle(zennContent, existingQiitaId);
        // Save Qiita article
        const qiitaFilename = zennSlug;
        await QiitaClient.createArticle(qiitaFilename, qiitaContent);
        // Publish to Qiita
        const qiitaId = await QiitaClient.publish(qiitaFilename, !!existingQiitaId);
        // Update sync mapping
        if (qiitaId) {
            await SyncStorage.updateMapping(zennSlug, qiitaId);
        }
        return {
            zennUrl: `https://zenn.dev/articles/${zennSlug}`,
            qiitaUrl: qiitaId ? `https://qiita.com/items/${qiitaId}` : undefined,
        };
    }
    /**
     * Sync all Zenn articles to Qiita
     */
    async syncAllArticles(forceUpdate = false) {
        const zennArticles = await ZennClient.getAllArticles();
        const result = {
            total: zennArticles.length,
            success: 0,
            failed: 0,
            skipped: 0,
        };
        for (const article of zennArticles) {
            try {
                const existingQiitaId = await SyncStorage.getQiitaId(article.slug);
                if (existingQiitaId && !forceUpdate) {
                    result.skipped++;
                    continue;
                }
                await this.postArticle(article.slug, true);
                result.success++;
            }
            catch (error) {
                result.failed++;
                // console.error(`Failed to sync ${article.slug}:`, error);
            }
        }
        return result;
    }
    /**
     * Pull articles from Qiita
     */
    async pullArticles(platform = 'qiita') {
        await QiitaClient.pull();
        const qiitaArticles = await QiitaClient.getAllArticles();
        const syncMapping = await SyncStorage.loadMapping();
        let pulledCount = 0;
        if (platform === 'both') {
            // Update Zenn articles from Qiita
            for (const qiitaArticle of qiitaArticles) {
                if (!qiitaArticle.id)
                    continue;
                const zennSlug = Object.keys(syncMapping).find(slug => syncMapping[slug].qiitaId === qiitaArticle.id);
                if (zennSlug) {
                    try {
                        const zennContent = await ZennClient.readArticle(zennSlug);
                        const updatedContent = FrontmatterConverter.updateZennFromQiita(zennContent, qiitaArticle.content);
                        const filePath = path.join('./articles', `${zennSlug}.md`);
                        await writeFile(filePath, updatedContent);
                        pulledCount++;
                    }
                    catch (error) {
                        // console.error(`Failed to update ${zennSlug}:`, error);
                    }
                }
            }
        }
        else {
            pulledCount = qiitaArticles.length;
        }
        return { count: pulledCount };
    }
    /**
     * Start preview server
     */
    async startPreview(platform) {
        // Kill existing preview process if any
        const existingProcess = this.previewProcesses.get(platform);
        if (existingProcess) {
            existingProcess.kill();
            this.previewProcesses.delete(platform);
        }
        const command = platform === 'zenn' ? 'zenn preview' : 'qiita preview';
        const defaultPort = platform === 'zenn' ? 8000 : 8888;
        const previewProcess = spawn(platform, ['preview'], {
            cwd: getProjectRoot(),
            stdio: 'pipe',
            env: {
                ...process.env,
                PATH: `${getProjectRoot()}/node_modules/.bin:${process.env.PATH}`
            }
        });
        this.previewProcesses.set(platform, previewProcess);
        // Wait a bit for the server to start
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            url: `http://localhost:${defaultPort}`,
            process: previewProcess,
        };
    }
    /**
     * Get sync mapping
     */
    async getSyncMapping() {
        return await SyncStorage.loadMapping();
    }
    /**
     * Publish Zenn articles by committing and pushing to Git
     */
    async publishZennArticles(commitMessage, push = true) {
        try {
            const projectRoot = getProjectRoot();
            // Check if there are any changes to commit
            const statusOutput = execSync('git status --porcelain articles/', {
                encoding: 'utf-8',
                cwd: projectRoot
            });
            if (!statusOutput.trim()) {
                return { message: 'No changes to commit in articles folder' };
            }
            // Add all articles to git
            execSync('git add articles/', {
                cwd: projectRoot,
                encoding: 'utf-8'
            });
            // Create commit message
            const message = commitMessage || `Add/Update Zenn articles - ${new Date().toISOString()}`;
            // Commit changes
            execSync(`git commit -m "${message}"`, {
                cwd: projectRoot,
                encoding: 'utf-8'
            });
            let resultMessage = `Committed with message: "${message}"`;
            // Push to remote if requested
            if (push) {
                try {
                    execSync('git push origin main', {
                        cwd: projectRoot,
                        encoding: 'utf-8'
                    });
                    resultMessage += '\nSuccessfully pushed to GitHub. Articles will be published on Zenn shortly.';
                }
                catch (pushError) {
                    resultMessage += '\nCommit successful but push failed. Run "git push origin main" manually.';
                    // console.error('Push error:', pushError);
                }
            }
            return { message: resultMessage };
        }
        catch (error) {
            // console.error(chalk.red('Failed to publish Zenn articles:'), error);
            throw error;
        }
    }
}
//# sourceMappingURL=sync-service.js.map