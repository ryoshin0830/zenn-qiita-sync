# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zenn-Qiita Sync Tool - a CLI application that synchronizes articles between Zenn and Qiita (Japanese technical blogging platforms). It allows authors to write once and publish to both platforms.

## Essential Commands

### Development
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run CLI in development mode (using tsx)
- `npm run lint` - Run ESLint on TypeScript files
- `npm run typecheck` - Type-check without emitting files

### Core Functionality
- `npm run init` - Initialize both Zenn and Qiita CLIs
- `npm run new` - Create a new article via CLI
- `npm run post` - Post an article to both platforms
- `npm run sync` - Sync all Zenn articles to Qiita
- `npm run web` - Launch web interface for article creation

### Testing & Preview
- `npm run preview:zenn` - Launch Zenn preview server
- `npm run preview:qiita` - Launch Qiita preview server

## Architecture

The codebase follows a modular architecture with clear separation of concerns:

- **CLI Layer** (`src/index.ts`): Commander.js-based CLI that orchestrates all commands
- **Client Wrappers** (`src/lib/zenn-client.ts`, `src/lib/qiita-client.ts`): Abstractions over the official Zenn and Qiita CLIs
- **Sync Service** (`src/lib/sync-service.ts`): Core synchronization logic that coordinates between platforms
- **Converter** (`src/lib/converter.ts`): Handles frontmatter format conversion between Zenn and Qiita formats
- **Storage** (`src/lib/storage.ts`): Manages persistent mapping between Zenn slugs and Qiita IDs in `.config/sync-mapping.json`

## Key Implementation Details

1. **Platform Integration**: The app wraps the official `@qiita/qiita-cli` and `zenn-cli` packages, executing them as child processes
2. **ID Mapping**: Maintains a JSON file (`.config/sync-mapping.json`) to track relationships between Zenn slugs and Qiita IDs
3. **Frontmatter Conversion**: Automatically converts between Zenn's format (e.g., `topics`) and Qiita's format (e.g., `tags`)
4. **Article Storage**: Articles are stored in the `articles/` directory as Markdown files with frontmatter

## Environment Setup

Requires a `.env` file with:
```
QIITA_TOKEN=your_qiita_api_token
```

## Important Notes

- The project targets ES2022 and uses ESNext modules
- All async operations use proper error handling with try-catch blocks
- The web interface runs on port 3210 by default
- Articles must be in the `articles/` directory with proper frontmatter to be recognized

## MCP Server

This project includes an MCP (Model Context Protocol) server implementation in the `mcp-server/` directory:

- **Build**: `npm run mcp:build` - Builds the MCP server
- **Configuration**: `.cursor/mcp.json` contains the local Cursor configuration
- **Available Tools**: init, create_article, post_article, sync_articles, pull_articles, preview
- **Available Resources**: articles://list (article list), sync://mapping (sync status)

The MCP server allows direct integration with Cursor and Claude Desktop for article management.