# Zenn-Qiita Sync MCPサーバー セットアップガイド

このガイドでは、Claude DesktopとCursorでMCPサーバーを使用する方法を詳しく説明します。

## 前提条件

1. Node.js（v16以上）がインストールされていること
2. Qiita APIトークンを取得済みであること（[こちら](https://qiita.com/settings/applications)から取得）
3. Zenn CLIのセットアップが完了していること（GitHubリポジトリと連携済み）

## 初期セットアップ

### 1. プロジェクトのクローンとビルド

```bash
# リポジトリをクローン
git clone <your-repo-url>
cd zenn-qiita-sync

# メインプロジェクトの依存関係をインストール
npm install

# MCPサーバーの依存関係をインストール
npm run mcp:install

# MCPサーバーをビルド
npm run mcp:build
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```bash
cp .env.sample .env
```

`.env` ファイルを編集してQiitaトークンを設定：

```env
QIITA_TOKEN=your_actual_qiita_api_token_here
```

## Claude Desktopでの設定

### 1. 設定ファイルの作成

Claude Desktopの設定ファイルを作成・編集します：

**macOS/Linux:**
```bash
# 設定ディレクトリを作成
mkdir -p ~/.config/claude

# 設定ファイルを編集
nano ~/.config/claude/claude_desktop_config.json
```

**Windows:**
```powershell
# 設定ディレクトリを作成
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# 設定ファイルを編集
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

### 2. MCPサーバーの設定を追加

以下の内容を `claude_desktop_config.json` に記述：

```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": [
        "/absolute/path/to/zenn-qiita-sync/mcp-server/build/index.js"
      ],
      "env": {
        "QIITA_TOKEN": "your_qiita_api_token_here"
      }
    }
  }
}
```

**重要**: 
- `/absolute/path/to/` を実際のプロジェクトパスに置き換えてください
- `your_qiita_api_token_here` を実際のQiitaトークンに置き換えてください

### 3. Claude Desktopを再起動

設定を反映させるため、Claude Desktopを完全に終了して再起動します。

## Cursorでの設定

### 1. プロジェクトローカル設定（推奨）

プロジェクトルートに `.cursor/mcp.json` が既に作成されています。
Cursorでプロジェクトを開くと自動的に認識されます。

### 2. グローバル設定（オプション）

全プロジェクトで使用したい場合：

```bash
# グローバル設定ファイルを編集
nano ~/.cursor/mcp.json
```

以下を追加：

```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": [
        "/absolute/path/to/zenn-qiita-sync/mcp-server/build/index.js"
      ],
      "env": {
        "QIITA_TOKEN": "your_qiita_api_token_here"
      }
    }
  }
}
```

### 3. Cursorでサーバーを有効化

1. Cursor Settings を開く（Cmd/Ctrl + ,）
2. 「MCP」セクションを探す
3. `zenn-qiita-sync` サーバーを見つけて有効化
4. 緑色のインジケーターが表示されれば成功

## 具体的な使用例

### Claude Desktopでの使用例

新しいチャットで以下のように話しかけます：

#### 1. 初期設定
```
Zenn-Qiita Syncの初期設定を実行してください
```

#### 2. 新規記事の作成
```
新しい技術記事を作成してください。
タイトル: "React Server Componentsの実践ガイド"
絵文字: ⚛️
タイプ: tech
トピック: React, TypeScript, Next.js
```

#### 3. 記事の投稿
```
slug "react-server-components-guide" の記事を
ZennとQiitaの両方に投稿してください
```

#### 4. 全記事の同期
```
すべてのZenn記事をQiitaに同期してください
```

#### 5. 記事一覧の確認
```
現在の記事一覧と同期状態を教えてください
```

### Cursorでの使用例

Cursorのチャット（Cmd/Ctrl + L）で同様に使用できます：

```
@zenn-qiita-sync 

新しい記事を作成して。
タイトルは「TypeScriptの型パズル入門」で、
絵文字は🧩、トピックはTypeScript, JavaScript, プログラミング
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. MCPサーバーが認識されない

**原因**: パスが正しくない、またはビルドされていない

**解決方法**:
```bash
# パスを確認
pwd  # 現在のディレクトリを確認

# 再ビルド
cd /path/to/zenn-qiita-sync
npm run mcp:build

# 設定ファイルのパスを修正
```

#### 2. Qiita認証エラー

**原因**: トークンが正しくない、または期限切れ

**解決方法**:
1. [Qiita設定ページ](https://qiita.com/settings/applications)で新しいトークンを生成
2. 設定ファイルのトークンを更新
3. Claude Desktop/Cursorを再起動

#### 3. 「Server does not support logging」エラー

**原因**: 古いバージョンのMCPサーバー

**解決方法**:
```bash
cd mcp-server
npm update @modelcontextprotocol/sdk
npm run build
```

#### 4. Zenn記事が見つからない

**原因**: 記事ディレクトリが正しくない

**解決方法**:
```bash
# articlesディレクトリがあるか確認
ls -la articles/

# なければ初期化
npm run init
```

### デバッグ方法

#### MCP Inspectorを使用

```bash
cd mcp-server
npx @modelcontextprotocol/inspector node build/index.js
```

ブラウザで表示されるURLにアクセスして、ツールの動作をテストできます。

#### ログの確認

**Claude Desktop**:
- View → Developer Tools → Console

**Cursor**:
- Help → Toggle Developer Tools → Console

## 高度な使い方

### バッチ処理

複数の記事を一度に作成：

```
以下の3つの記事を作成してください：

1. タイトル: "Dockerコンテナの最適化テクニック"
   絵文字: 🐳
   トピック: Docker, DevOps

2. タイトル: "GraphQL入門ガイド"
   絵文字: 📊
   トピック: GraphQL, API, Node.js

3. タイトル: "GitHub Actions実践編"
   絵文字: 🤖
   トピック: GitHub, CI/CD, DevOps
```

### 条件付き同期

```
まだQiitaに投稿されていない記事だけを同期してください
```

### プレビューとの連携

```
Zennのプレビューサーバーを起動して、
同時に最新の記事一覧も表示してください
```

## ベストプラクティス

1. **定期的な同期**: 週に1回程度、全記事の同期を実行
2. **バックアップ**: 重要な記事は別途バックアップを取る
3. **タグの管理**: ZennとQiitaで共通して使えるタグを選ぶ
4. **下書き管理**: 下書きは`published: false`で管理

## サポート

問題が解決しない場合は、以下の情報を含めてイシューを作成してください：

1. エラーメッセージの全文
2. 使用しているOS
3. Node.jsのバージョン（`node -v`）
4. 実行したコマンド
5. 設定ファイルの内容（トークンは除く）