# アーキテクチャ解説

## システム構成図

```
┌─────────────────┐     ┌─────────────────┐
│ Claude Desktop  │     │     Cursor      │
│   (MCP Client)  │     │  (MCP Client)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     │ MCP Protocol
                     │
         ┌───────────┴───────────┐
         │    MCP Server         │
         │ (zenn-qiita-sync-mcp) │
         └───────────┬───────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
┌─────┴──────┐              ┌──────┴─────┐
│ Zenn CLI   │              │ Qiita CLI  │
│  Wrapper   │              │  Wrapper   │
└─────┬──────┘              └──────┬─────┘
      │                             │
      │                             │
┌─────┴──────┐              ┌──────┴─────┐
│   Zenn     │              │   Qiita    │
│ (Git Push) │              │   (API)    │
└────────────┘              └────────────┘
```

## コンポーネント詳細

### 1. MCPサーバー層

**役割**: MCP クライアント（Claude Desktop、Cursor）からのリクエストを処理

**主要ファイル**:
- `mcp-server/src/index.ts`: MCPサーバーのエントリーポイント
- `mcp-server/src/services/sync-service.ts`: 同期ロジック
- `mcp-server/src/services/article-service.ts`: 記事管理ロジック

**提供機能**:
- Tools: 6種類のアクション（init, create_article, post_article, sync_articles, pull_articles, preview）
- Resources: 2種類のリソース（articles://list, sync://mapping）

### 2. CLIラッパー層

**役割**: 各プラットフォームのCLIを抽象化

**主要ファイル**:
- `src/lib/zenn-client.ts`: Zenn CLIのラッパー
- `src/lib/qiita-client.ts`: Qiita CLIのラッパー

**特徴**:
- 子プロセスとしてCLIを実行
- 結果をパースして構造化データとして返す
- エラーハンドリングの統一

### 3. データ変換層

**役割**: プラットフォーム間のデータフォーマット変換

**主要ファイル**:
- `src/lib/converter.ts`: Frontmatter変換ロジック

**変換内容**:
```typescript
// Zenn形式
{
  title: "記事タイトル",
  emoji: "📝",
  type: "tech",
  topics: ["javascript", "react"],
  published: true
}

// ↓↑ 相互変換

// Qiita形式
{
  title: "記事タイトル",
  tags: [
    { name: "javascript" },
    { name: "react" }
  ],
  private: false,
  id: "xxxxxxxxxxxxx"
}
```

### 4. 永続化層

**役割**: 同期状態の管理

**主要ファイル**:
- `src/lib/storage.ts`: マッピング情報の保存・読み込み

**データ構造**:
```json
{
  "zenn-slug-1": {
    "qiitaId": "xxxxxxxxxxxx",
    "lastSynced": "2024-03-20T10:00:00Z"
  }
}
```

## データフロー

### 1. 記事作成フロー

```
1. MCP Client → "create_article" リクエスト
2. MCP Server → ArticleService.createArticle()
3. ArticleService → ZennClient.createArticle()
4. ZennClient → `npx zenn new:article` 実行
5. ファイルシステムに .md ファイル作成
6. レスポンスを MCP Client に返却
```

### 2. 同期フロー

```
1. MCP Client → "sync_articles" リクエスト
2. MCP Server → SyncService.syncAllArticles()
3. SyncService → ZennClient.getAllArticles()
4. 各記事に対して:
   a. Converter.createQiitaArticle() で変換
   b. QiitaClient.createArticle() でファイル作成
   c. QiitaClient.publish() で投稿
   d. Storage.updateMapping() でマッピング保存
5. 結果サマリーを MCP Client に返却
```

## セキュリティ考慮事項

### 1. APIトークンの管理

- 環境変数経由で渡す（`.env` ファイル）
- MCPクライアントの設定でも環境変数として設定可能
- トークンはログに出力しない

### 2. ファイルアクセス

- 記事ファイルは `articles/` と `public/` ディレクトリに限定
- 設定ファイルは `.config/` ディレクトリに限定
- 相対パスを使用してディレクトリトラバーサルを防ぐ

## パフォーマンス最適化

### 1. 並列処理

- 複数記事の同期時は、API レート制限を考慮して順次処理
- プレビューサーバーは別プロセスで起動

### 2. キャッシング

- 同期マッピングはメモリにキャッシュ
- 記事一覧は必要時に都度読み込み（リアルタイム性重視）

## エラーハンドリング

### 1. エラーの種類

- **認証エラー**: Qiita APIトークンが無効
- **ネットワークエラー**: API呼び出し失敗
- **ファイルエラー**: 記事ファイルが見つからない
- **同期エラー**: プラットフォーム間の不整合

### 2. エラー処理戦略

- 個別記事のエラーは記録して処理を継続
- 致命的エラーは即座に中断してユーザーに通知
- すべてのエラーはMCPログとして記録

## 拡張性

### 1. 新しいプラットフォームの追加

新しいプラットフォーム（例：note.com）を追加する場合：

1. `src/lib/note-client.ts` を作成
2. `IArticleClient` インターフェースを実装
3. `Converter` に変換ロジックを追加
4. MCPツールに新しいコマンドを追加

### 2. 新機能の追加

- **スケジュール投稿**: cronジョブとの連携
- **統計機能**: PV数やいいね数の集計
- **テンプレート機能**: よく使う記事構成の保存

## 開発のベストプラクティス

### 1. テスト戦略

```typescript
// ユニットテスト例
describe('Converter', () => {
  it('should convert Zenn format to Qiita format', () => {
    const zennData = { topics: ['react'] };
    const qiitaData = Converter.toQiita(zennData);
    expect(qiitaData.tags).toEqual([{ name: 'react' }]);
  });
});
```

### 2. デバッグ方法

```bash
# MCP Inspector でインタラクティブにテスト
npx @modelcontextprotocol/inspector node mcp-server/build/index.js

# ログレベルを上げて詳細を確認
DEBUG=* node mcp-server/build/index.js
```

### 3. コード品質

- TypeScriptの厳格モードを使用
- ESLintで一貫したコードスタイルを維持
- 非同期処理は必ずエラーハンドリング

## 今後の展望

1. **プラグインアーキテクチャ**: カスタムプラットフォームの追加を容易に
2. **Web UI**: ブラウザベースの管理画面
3. **GitHub Actions統合**: CI/CDパイプラインでの自動投稿
4. **AI支援機能**: 記事の品質チェックや改善提案