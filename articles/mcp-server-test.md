---
title: "MCPサーバーで実現するZenn-Qiita記事管理の自動化"
emoji: "🔧"
type: "tech"
topics: ["MCP", "Zenn", "Qiita", "TypeScript", "CLI"]
published: false
---

# MCPサーバーで実現するZenn-Qiita記事管理の自動化

## はじめに

この記事では、Model Context Protocol (MCP) サーバーを活用してZennとQiitaの記事管理を自動化する方法について解説します。MCPサーバーを実装することで、記事の作成から投稿まで一連の作業を効率化できます。

## MCPサーバーとは

Model Context Protocol (MCP) は、AIモデルが外部のツールやリソースにアクセスするための統一されたプロトコルです。MCPサーバーを実装することで、以下のようなメリットがあります：

- **統一されたインターフェース**: 複数のプラットフォーム（ZennとQiita）を一つのツールで管理
- **自動化**: 記事の作成から投稿まで自動化
- **一貫性**: 同じ記事を複数のプラットフォームに同期

## 実装の概要

### MCPサーバーの構成

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "zenn-qiita-sync",
  version: "1.0.0",
});
```

### 利用可能なツール

実装されているMCPツール：

1. **init**: ZennとQiita CLIの初期化
2. **create_article**: 新しい記事の作成
3. **post_article**: 記事をZennとQiitaに投稿
4. **sync_articles**: 全記事の同期
5. **pull_articles**: Qiitaから記事を取得
6. **preview**: プレビューサーバーの起動

## 使用方法

### 1. セットアップ

```bash
# MCPサーバーのビルド
npm run mcp:build

# 初期化
mcp call init
```

### 2. 記事の作成

```typescript
// MCPツールを使用した記事作成
{
  name: "create_article",
  arguments: {
    title: "記事タイトル",
    emoji: "🔧",
    type: "tech",
    topics: ["MCP", "Zenn", "Qiita"],
    published: false
  }
}
```

### 3. 記事の投稿

```typescript
// 作成した記事をZennとQiitaに投稿
{
  name: "post_article", 
  arguments: {
    slug: "article-slug",
    updateIfExists: false
  }
}
```

## メリット

### 1. 効率化
- 一度の操作で複数のプラットフォームに投稿
- frontmatterの自動変換
- 記事の状態管理

### 2. 一貫性
- 同じ内容を両プラットフォームで維持
- メタデータの同期
- バージョン管理

### 3. 自動化
- CLI経由での投稿
- 定期的な同期
- エラーハンドリング

## 技術的な実装詳細

### スキーマ定義

```typescript
const CreateArticleSchema = z.object({
  title: z.string().describe("Article title"),
  emoji: z.string().describe("Article emoji (for Zenn)"),
  type: z.enum(["tech", "idea"]).describe("Article type"),
  published: z.boolean().default(false),
  topics: z.array(z.string()).describe("Article topics/tags"),
});
```

### エラーハンドリング

```typescript
try {
  const result = await syncService.postArticle(slug, updateIfExists);
  return {
    content: [{
      type: "text",
      text: `記事投稿成功!\nZenn: ${result.zennUrl}\nQiita: ${result.qiitaUrl}`
    }]
  };
} catch (error) {
  throw new McpError(ErrorCode.InternalError, error.message);
}
```

## 今後の展望

- 画像の自動アップロード機能
- 記事の差分管理
- スケジュール投稿機能
- 複数アカウント対応

## まとめ

MCPサーバーを活用することで、ZennとQiitaの記事管理を大幅に効率化できます。統一されたインターフェースにより、開発者は記事の作成に集中でき、技術情報の共有がより簡単になります。

このツールを使用することで、技術記事の執筆と公開のワークフローが劇的に改善されるでしょう。 