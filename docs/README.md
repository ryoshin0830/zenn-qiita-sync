# Zenn-Qiita Sync

ZennとQiitaの両方に記事を同時投稿・管理できるCLIツールです。

## 特徴

- 🚀 Markdownファイルを一度書くだけで両プラットフォームに投稿
- 🔄 記事の新規投稿と更新に対応
- 📝 frontmatterの自動変換（Zenn形式 ↔ Qiita形式）
- 🔐 環境変数によるAPIトークン管理
- 📊 投稿状態の一元管理

## インストール

```bash
# リポジトリをクローン
git clone <your-repo-url>
cd zenn-qiita-sync

# 依存関係をインストール
npm install

# ビルド
npm run build
```

## セットアップ

### 1. 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集してQiitaトークンを設定：

```env
QIITA_TOKEN=your_qiita_token_here
```

Qiitaトークンはこちらから発行：
https://qiita.com/settings/tokens/new?read_qiita=1&write_qiita=1&description=zenn-qiita-sync

### 2. 初期化

```bash
npm run dev init
```

これにより：
- Zenn CLIが初期化されます
- Qiita CLIの認証が設定されます
- 必要なディレクトリが作成されます

## 使い方

### 🎯 最速コマンド

```bash
# Webで記事作成（一番簡単！）
npm run web

# もっと短く！
./web.sh
```

### 📋 その他のコマンド

```bash
# 記事を投稿
npm run post 記事のslug

# 全記事を同期
npm run sync

# コマンドラインで記事作成
npm run new -- --title "タイトル" --emoji "📝" --topics "タグ1,タグ2"
```

### 📝 新規記事を作成

#### 方法1: コマンドライン（推奨）

```bash
npm run new -- --title "記事タイトル" --emoji "🚀" --topics "JavaScript,React"
```

#### 方法2: Webインターフェース（超簡単！）🌟

```bash
npm run new -- --web
# ブラウザが自動的に開いて、フォームで入力できます！
```

#### 方法3: 対話形式（簡単）

```bash
./create-article.sh
# タイトル、絵文字、タグを順番に入力
```

### 既存のZenn記事を両方に投稿

```bash
npm run dev post <zenn-slug>
```

例：
```bash
npm run dev post my-first-article
```

### すべてのZenn記事をQiitaに同期

```bash
npm run dev sync
```

### Qiitaから変更を取得

```bash
npm run dev pull
```

### プレビュー

Zennのプレビュー：
```bash
npm run dev preview:zenn
```

Qiitaのプレビュー：
```bash
npm run dev preview:qiita
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `init` | 初期設定 |
| `new` | 新規記事作成 |
| `post <slug>` | 指定記事を両方に投稿 |
| `sync` | 全記事を同期 |
| `pull` | Qiitaから変更を取得 |
| `preview:zenn` | Zennプレビュー起動 |
| `preview:qiita` | Qiitaプレビュー起動 |

## 仕組み

1. **frontmatter変換**: ZennとQiitaで異なるメタデータ形式を自動変換
2. **ID管理**: `.config/sync-mapping.json`で記事の対応関係を保存
3. **CLI連携**: 各プラットフォームの公式CLIをラップして統合

## 注意事項

- Zennへの反映にはGitHubリポジトリへのpushが必要です
- 画像は各プラットフォームに個別にアップロードする必要があります
- タグ/トピックスはZennが最大5個までの制限があります

## 開発

```bash
# 開発モード
npm run dev

# TypeScriptのチェック
npm run typecheck

# リント
npm run lint
```

## MCPサーバー

Zenn-Qiita SyncツールはMCP（Model Context Protocol）サーバーとしても利用できます。これにより、CursorやClaude Desktopから直接記事の管理が可能になります。

### MCPサーバーのセットアップ

1. MCPサーバーの依存関係をインストール：
```bash
npm run mcp:install
```

2. MCPサーバーをビルド：
```bash
npm run mcp:build
```

### Cursorでの使用

プロジェクトルートの`.cursor/mcp.json`に設定済みです。Cursor Settings > MCPでサーバーを有効化してください。

グローバルに使用する場合は、`~/.cursor/mcp.json`に以下を追加：

```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": [
        "/path/to/zenn-qiita-sync/mcp-server/build/index.js"
      ],
      "env": {
        "QIITA_TOKEN": "your_qiita_api_token"
      }
    }
  }
}
```

### 利用可能なMCPツール

- `init`: Zenn/Qiita CLIの初期化
- `create_article`: 新規記事作成
- `post_article`: 記事を両プラットフォームに投稿
- `sync_articles`: 全記事の同期
- `pull_articles`: Qiitaから記事を取得
- `preview`: プレビューサーバーの起動

### 使用例

Cursorのチャットで以下のように使用できます：

```
「TypeScriptの基礎という記事を作成して」
「slug: typescript-basics を両方のプラットフォームに投稿して」
「すべての記事を同期して」
```

詳細は[mcp-server/README.md](./mcp-server/README.md)をご覧ください。

## ライセンス

MIT