# Zenn-Qiita Sync MCP Server

ZennとQiitaの記事を同期するためのMCP（Model Context Protocol）サーバーです。CursorやClaude Desktopから記事の投稿や管理を行うことができます。

## ZennとQiitaの公開方法の違い

### Zenn
- **Gitリポジトリベース**: 記事はGitHubリポジトリで管理
- **公開方法**: mainブランチにpushすることで自動的に公開
- **下書き/公開の制御**: フロントマターの`published`フィールドで制御
- **必要な手順**:
  1. 記事を作成（`create_article`）
  2. 記事を編集（`edit_article`）- 必要に応じて
  3. GitHubにコミット・プッシュ（`publish_zenn`）

### Qiita
- **APIベース**: Qiita APIを使用して直接投稿
- **公開方法**: `post_article`コマンドで即座に公開
- **下書き/公開の制御**: APIパラメータで制御
- **必要な手順**:
  1. 記事を作成（`create_article`）
  2. 記事を投稿（`post_article`）

## 特徴

- 🚀 Zenn・Qiita両方への記事投稿
- 📝 記事の作成・編集・同期
- 🔄 双方向同期のサポート
- 👀 プレビューサーバーの起動
- 📊 同期状態の管理

## インストール

### 1. 依存関係のインストール

```bash
cd mcp-server
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、Qiita APIトークンを設定します：

```env
QIITA_TOKEN=your_qiita_api_token_here
```

## Cursorでの使用方法

### グローバル設定

`~/.cursor/mcp.json`に以下を追加：

```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": [
        "/path/to/zenn-qiita-sync/mcp-server/build/index.js"
      ],
      "env": {
        "QIITA_TOKEN": "your_qiita_api_token_here"
      }
    }
  }
}
```

### プロジェクト設定

プロジェクトルートに`.cursor/mcp.json`を作成：

```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": [
        "./mcp-server/build/index.js"
      ]
    }
  }
}
```

## 利用可能なツール

### 1. init
Zenn CLIとQiita CLIを初期化します。

```
Parameters: なし
```

### 2. create_article
新しい記事を作成します。

```
Parameters:
- title (string, required): 記事のタイトル
- emoji (string): 記事の絵文字（デフォルト: 📝）
- type (enum: tech/idea): 記事タイプ（デフォルト: tech）
- published (boolean): 公開するか（デフォルト: false）
- topics (array): トピック/タグのリスト
- interactive (boolean): インタラクティブモードを使用
```

### 3. post_article
記事を両方のプラットフォームに投稿します。

```
Parameters:
- slug (string, required): 記事のスラッグ（.md拡張子なし）
- updateIfExists (boolean): 既存記事を更新するか（デフォルト: false）
```

### 4. sync_articles
すべてのZenn記事をQiitaに同期します。

```
Parameters:
- forceUpdate (boolean): すべての記事を強制更新（デフォルト: false）
```

### 5. pull_articles
Qiitaから記事を取得します。

```
Parameters:
- platform (enum: qiita/both): 取得元プラットフォーム
```

### 6. preview
プレビューサーバーを起動します。

```
Parameters:
- platform (enum: zenn/qiita): プレビューするプラットフォーム
```

### 7. get_article
指定した記事の内容とメタデータを取得します。

```
Parameters:
- slug (string): 記事のスラッグ（ファイル名から.mdを除いたもの）
```

### 8. edit_article
記事の内容やメタデータを編集します。

```
Parameters:
- slug (string): 記事のスラッグ（必須）
- content (string, optional): 新しい記事内容（マークダウン）
- title (string, optional): 新しいタイトル
- emoji (string, optional): 新しい絵文字
- type (enum: tech/idea, optional): 新しい記事タイプ
- published (boolean, optional): 公開状態
- topics (string[], optional): 新しいトピック/タグの配列
```

### 9. delete_article
記事を削除します。

```
Parameters:
- slug (string): 削除する記事のスラッグ
```

### 10. publish_zenn
Zenn記事をGitHubにコミット・プッシュして公開します。
（Zennは記事をGitリポジトリのmainブランチにpushすることで公開されます）

```
Parameters:
- message (string, optional): Gitコミットメッセージ（省略時は自動生成）
- push (boolean, optional): リモートリポジトリにプッシュするか（デフォルト: true）
```

## 利用可能なリソース

### 1. articles://list
すべての記事とその同期状態を取得します。

### 2. sync://mapping
ZennスラッグとQiita IDのマッピング情報を取得します。

## 使用例

Cursorのチャットで以下のように使用できます：

```
「新しい記事を作成して、タイトルは"TypeScriptの基礎"、絵文字は🚀、トピックはTypeScriptとNode.jsで」

「slug: typescript-basics の記事を両方のプラットフォームに投稿して」

「typescript-basics の記事の内容を表示して」

「typescript-basics の記事のタイトルを"TypeScript入門ガイド"に変更して」

「typescript-basics の記事に以下の内容を追加して：
## 新しいセクション
ここに新しい内容を書きます。」

「不要になった old-article を削除して」

「すべての記事を同期して」

「Zennのプレビューサーバーを起動して」

「Zenn記事をGitHubに公開して」
```

## デバッグ

### MCP Inspectorの使用

```bash
npx @modelcontextprotocol/inspector node mcp-server/build/index.js
```

### ログの確認

MCPサーバーはログメッセージを送信します。Cursorの開発者ツールやMCP Inspectorで確認できます。

## トラブルシューティング

### Qiita認証エラー

`.env`ファイルに正しいQIITA_TOKENが設定されているか確認してください。

### Qiita APIでForbiddenエラーが発生する

このエラーは主に以下の原因で発生します：

1. **APIトークンの権限不足**
   - Qiitaの設定画面でトークンに「read_qiita」と「write_qiita」の権限があるか確認
   - 新しいトークンを生成する場合は、必要な権限にチェックを入れる

2. **レート制限**
   - Qiita APIには1時間あたり1000リクエストの制限があります
   - 短時間に大量の記事を投稿すると制限に引っかかる可能性があります

3. **記事の内容**
   - タグが5個を超えている（Qiitaは最大5個まで）
   - タグ名に使用できない文字が含まれている
   - 記事の内容が極端に短い

### Zennの記事が公開されない

- `publish_zenn`コマンドを実行してGitHubにプッシュしたか確認
- GitHubリポジトリがZennと正しく連携されているか確認
- `published: true`がフロントマターに設定されているか確認

### ツールが表示されない

1. Cursor Settings > MCPでサーバーが有効になっているか確認
2. サーバーのパスが正しいか確認
3. ビルドが完了しているか確認（`npm run build`）

## クイックスタート

### 1. 最小限のセットアップ（5分で開始）

```bash
# 1. プロジェクトをクローン
git clone <your-repo-url>
cd zenn-qiita-sync

# 2. 依存関係をインストール
npm install
npm run mcp:install

# 3. ビルド
npm run mcp:build

# 4. 環境変数を設定
echo "QIITA_TOKEN=your_token_here" > .env
```

### 2. Claude Desktopですぐに使う

1. Claude Desktopの設定ファイルを開く:
   - Mac: `~/.config/claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. 以下を追加（パスとトークンを自分のものに変更）:
```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": ["/path/to/project/mcp-server/build/index.js"],
      "env": {
        "QIITA_TOKEN": "your_token"
      }
    }
  }
}
```

3. Claude Desktopを再起動

4. 新しいチャットで試す:
```
「Zenn-Qiita Syncを初期化して」
「TypeScriptの入門記事を作成して」
```

## 詳細なセットアップガイド

より詳しい設定方法は[SETUP_GUIDE.md](./SETUP_GUIDE.md)を参照してください。

## 実践的な使用例

実際の使用例は[EXAMPLES.md](../EXAMPLES.md)を参照してください。

## ライセンス

MIT