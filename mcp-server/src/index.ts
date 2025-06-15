#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ZennQiitaSyncService } from "./services/sync-service.js";
import { ArticleService } from "./services/article-service.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Parameter schemas
const InitSchema = z.object({});

const CreateArticleSchema = z.object({
  title: z.string().describe("Article title"),
  emoji: z.string().describe("Article emoji (for Zenn)"),
  type: z.enum(["tech", "idea"]).describe("Article type"),
  published: z.boolean().default(false).describe("Whether to publish immediately"),
  topics: z.array(z.string()).describe("Article topics/tags"),
  interactive: z.boolean().default(false).describe("Use interactive mode"),
});

const PostArticleSchema = z.object({
  slug: z.string().describe("Article slug (filename without .md)"),
  updateIfExists: z.boolean().default(false).describe("Update if article already exists"),
});

const SyncSchema = z.object({
  forceUpdate: z.boolean().default(false).describe("Force update all articles"),
});

const PullSchema = z.object({
  platform: z.enum(["qiita", "both"]).describe("Platform to pull from"),
});

const PreviewSchema = z.object({
  platform: z.enum(["zenn", "qiita"]).describe("Platform to preview"),
});

const GetArticleSchema = z.object({
  slug: z.string().describe("Article slug (filename without .md)"),
});

const EditArticleSchema = z.object({
  slug: z.string().describe("Article slug (filename without .md)"),
  content: z.string().optional().describe("New article content (markdown)"),
  title: z.string().optional().describe("New article title"),
  emoji: z.string().optional().describe("New article emoji"),
  type: z.enum(["tech", "idea"]).optional().describe("New article type"),
  published: z.boolean().optional().describe("New published status"),
  topics: z.array(z.string()).optional().describe("New article topics/tags"),
});

const DeleteArticleSchema = z.object({
  slug: z.string().describe("Article slug (filename without .md)"),
});

const PublishZennSchema = z.object({
  message: z.string().optional().describe("Git commit message"),
  push: z.boolean().default(true).describe("Whether to push to remote repository"),
});

// Initialize services
const syncService = new ZennQiitaSyncService();
const articleService = new ArticleService(syncService);

// Create MCP server
const server = new Server(
  {
    name: "zenn-qiita-sync",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Log helper - safe logging that uses stderr for debugging
function log(level: "info" | "error" | "warning", message: string, data?: any) {
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
        name: "post_article",
        description: "Post an article to both Zenn and Qiita",
        inputSchema: zodToJsonSchema(PostArticleSchema),
      },
      {
        name: "sync_articles",
        description: "Sync all Zenn articles to Qiita",
        inputSchema: zodToJsonSchema(SyncSchema),
      },
      {
        name: "pull_articles",
        description: "Pull articles from Qiita to local",
        inputSchema: zodToJsonSchema(PullSchema),
      },
      {
        name: "preview",
        description: "Start preview server for Zenn or Qiita",
        inputSchema: zodToJsonSchema(PreviewSchema),
      },
      {
        name: "get_article",
        description: "Get the content and metadata of an article",
        inputSchema: zodToJsonSchema(GetArticleSchema),
      },
      {
        name: "edit_article",
        description: "Edit an article's content and/or metadata",
        inputSchema: zodToJsonSchema(EditArticleSchema),
      },
      {
        name: "delete_article",
        description: "Delete an article",
        inputSchema: zodToJsonSchema(DeleteArticleSchema),
      },
      {
        name: "publish_zenn",
        description: "Commit and push Zenn articles to GitHub (required for Zenn publication)",
        inputSchema: zodToJsonSchema(PublishZennSchema),
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

      case "post_article": {
        const params = PostArticleSchema.parse(args);
        log("info", "Posting article", params);
        
        const result = await syncService.postArticle(params.slug, params.updateIfExists);
        return {
          content: [
            {
              type: "text",
              text: `Article posted successfully!\nZenn: ${result.zennUrl || "Not available"}\nQiita: ${result.qiitaUrl || "Not available"}`,
            },
          ],
        };
      }

      case "sync_articles": {
        const params = SyncSchema.parse(args);
        log("info", "Syncing articles", params);
        
        const result = await syncService.syncAllArticles(params.forceUpdate);
        return {
          content: [
            {
              type: "text",
              text: `Sync completed!\nTotal: ${result.total}\nSuccess: ${result.success}\nFailed: ${result.failed}\nSkipped: ${result.skipped}`,
            },
          ],
        };
      }

      case "pull_articles": {
        const params = PullSchema.parse(args);
        log("info", "Pulling articles", params);
        
        const result = await syncService.pullArticles(params.platform);
        return {
          content: [
            {
              type: "text",
              text: `Pull completed!\nArticles pulled: ${result.count}`,
            },
          ],
        };
      }

      case "preview": {
        const params = PreviewSchema.parse(args);
        log("info", "Starting preview", params);
        
        const result = await syncService.startPreview(params.platform);
        return {
          content: [
            {
              type: "text",
              text: `Preview server started at: ${result.url}`,
            },
          ],
        };
      }

      case "get_article": {
        const params = GetArticleSchema.parse(args);
        log("info", "Getting article", params);
        
        const result = await articleService.getArticle(params.slug);
        return {
          content: [
            {
              type: "text",
              text: `# ${result.title}\n\nPath: ${result.path}\n\n## Content:\n${result.content}\n\n## Metadata:\n${JSON.stringify(result.frontmatter, null, 2)}`,
            },
          ],
        };
      }

      case "edit_article": {
        const params = EditArticleSchema.parse(args);
        log("info", "Editing article", params);
        
        const result = await articleService.editArticle(params);
        return {
          content: [
            {
              type: "text",
              text: `Article edited successfully!\nSlug: ${result.slug}\nTitle: ${result.title}\nPath: ${result.path}`,
            },
          ],
        };
      }

      case "delete_article": {
        const params = DeleteArticleSchema.parse(args);
        log("info", "Deleting article", params);
        
        await articleService.deleteArticle(params.slug);
        return {
          content: [
            {
              type: "text",
              text: `Article deleted successfully: ${params.slug}`,
            },
          ],
        };
      }

      case "publish_zenn": {
        const params = PublishZennSchema.parse(args);
        log("info", "Publishing Zenn articles", params);
        
        const result = await syncService.publishZennArticles(params.message, params.push);
        return {
          content: [
            {
              type: "text",
              text: `Zenn articles ${params.push ? 'committed and pushed' : 'committed'}!\n${result.message}`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    log("error", "Tool execution failed", error);
    
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    
    throw error;
  }
});

// Define available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "articles://list",
        name: "Article List",
        description: "List of all articles with their sync status",
        mimeType: "application/json",
      },
      {
        uri: "sync://mapping",
        name: "Sync Mapping",
        description: "Mapping between Zenn slugs and Qiita IDs",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "articles://list": {
      const articles = await articleService.listArticles();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(articles, null, 2),
          },
        ],
      };
    }

    case "sync://mapping": {
      const mapping = await syncService.getSyncMapping();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(mapping, null, 2),
          },
        ],
      };
    }

    default:
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource: ${uri}`
      );
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