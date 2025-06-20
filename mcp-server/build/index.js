#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { ZennQiitaSyncService } from "./services/sync-service.js";
import { ArticleService } from "./services/article-service.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getProjectRoot } from './utils/cli.js';
import { XHelper } from './lib/x-helper.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Parameter schemas
const InitSchema = z.object({});
const CreateArticleSchema = z.object({
    title: z.string().describe("Article title"),
    emoji: z.string().describe("Article emoji (for Zenn)"),
    type: z.enum(["tech", "idea"]).describe("Article type"),
    published: z.boolean().default(true).describe("Whether to publish immediately"),
    topics: z.array(z.string()).describe("Article topics/tags"),
    interactive: z.boolean().default(false).describe("Use interactive mode"),
});
const PostArticleSchema = z.object({
    slug: z.string().describe("Article slug (filename without .md)"),
    updateIfExists: z.boolean().default(false).describe("Update if article already exists"),
});
const EditArticleSchema = z.object({
    slug: z.string().describe("Article slug (filename without .md)"),
    content: z.string().describe("Article content in markdown format"),
});
const PostToXSchema = z.object({
    title: z.string().describe("Article title"),
    topics: z.array(z.string()).describe("Article topics/tags"),
    qiitaUrl: z.string().describe("Qiita URL of the posted article"),
});
// Initialize services
const syncService = new ZennQiitaSyncService();
const articleService = new ArticleService(syncService);
let xHelper = null;
// Initialize X helper if credentials are available
if (process.env.X_API_KEY && process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_TOKEN_SECRET) {
    xHelper = new XHelper({
        appKey: process.env.X_API_KEY,
        appSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
    });
}
// Create MCP server
const server = new Server({
    name: "zenn-qiita-sync",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Log helper - safe logging that uses stderr for debugging
function log(level, message, data) {
    // Always log to stderr for debugging
    const logMessage = data ? `${message}: ${JSON.stringify(data)}` : message;
    console.error(`[${new Date().toISOString()}] [${level}] ${logMessage}`);
}
// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "init",
                description: "Initialize both Zenn and Qiita CLIs",
                inputSchema: zodToJsonSchema(InitSchema),
            },
            {
                name: "create_article",
                description: "Create a new article with specified metadata",
                inputSchema: zodToJsonSchema(CreateArticleSchema),
            },
            {
                name: "edit_article",
                description: "Edit an article content",
                inputSchema: zodToJsonSchema(EditArticleSchema),
            },
            {
                name: "post_article",
                description: "Post an article to both Zenn and Qiita",
                inputSchema: zodToJsonSchema(PostArticleSchema),
            },
            {
                name: "post_to_x",
                description: "Post article summary to X (Twitter) with Qiita URL",
                inputSchema: zodToJsonSchema(PostToXSchema),
            },
        ],
    };
});
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        switch (name) {
            case "init": {
                log("info", "Initializing Zenn and Qiita CLIs");
                await syncService.initialize();
                return {
                    content: [
                        {
                            type: "text",
                            text: "Successfully initialized both Zenn and Qiita CLIs. Ready to sync articles!",
                        },
                    ],
                };
            }
            case "create_article": {
                const params = CreateArticleSchema.parse(args);
                log("info", "Creating new article", params);
                const result = await articleService.createArticle(params);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Article created successfully!\nSlug: ${result.slug}\nPath: ${result.path}`,
                        },
                    ],
                };
            }
            case "edit_article": {
                const params = EditArticleSchema.parse(args);
                log("info", "Editing article", params);
                const result = await articleService.editArticle({
                    slug: params.slug,
                    content: params.content,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Article edited successfully!\nSlug: ${result.slug}\nPath: ${result.path}`,
                        },
                    ],
                };
            }
            case "post_article": {
                const params = PostArticleSchema.parse(args);
                log("info", "Posting article", params);
                const result = await syncService.postArticle(params.slug, params.updateIfExists);
                // Delete all .md files after successful posting
                try {
                    const { execSync } = await import('child_process');
                    const projectRoot = getProjectRoot();
                    execSync(`find "${projectRoot}" -name "*.md" -type f -exec rm {} \\;`, {
                        cwd: projectRoot,
                        encoding: 'utf-8'
                    });
                    log("info", "Deleted all .md files in the project");
                }
                catch (error) {
                    log("warning", "Failed to delete .md files", error);
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: `Article posted successfully!\nQiita: ${result.qiitaUrl || "Not available"}\n\nAll .md files have been deleted.`,
                        },
                    ],
                };
            }
            case "post_to_x": {
                const params = PostToXSchema.parse(args);
                log("info", "Posting to X", params);
                if (!xHelper) {
                    throw new McpError(ErrorCode.InternalError, "X (Twitter) credentials not configured");
                }
                const result = await xHelper.postArticleSummary(params.title, params.topics, params.qiitaUrl);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Posted to X successfully!\nTweet URL: ${result.url}`,
                        },
                    ],
                };
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        log("error", "Tool execution failed", error);
        if (error instanceof z.ZodError) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        throw error;
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    // Set up error handling
    transport.onerror = (error) => {
        console.error("Transport error:", error);
        process.exit(1);
    };
    // Connect without sending immediate log messages
    await server.connect(transport);
    // The server will handle logging after the client initializes
    console.error("Zenn-Qiita Sync MCP Server started successfully");
}
main().catch((error) => {
    console.error("Server startup error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map