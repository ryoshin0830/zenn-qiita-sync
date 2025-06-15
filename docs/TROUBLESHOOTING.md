# トラブルシューティングガイド

## Claude Desktopでサーバーが起動しない場合

### 症状
- "Server disconnected"エラーが表示される
- MCPサーバーが認識されない
- ツールが使用できない

### 解決方法

#### 1. 設定ファイルのパスを確認

`~/Library/Application Support/Claude/claude_desktop_config.json` の設定を確認：

```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": ["/absolute/path/to/zenn-qiita-sync/mcp-server/build/index.js"],
      "env": {
        "QIITA_TOKEN": "your_token_here"
      }
    }
  }
}
```

**重要**: 
- パスは絶対パスで指定
- `~`や相対パスは使用しない
- 実際のプロジェクトパスに置き換える

#### 2. ビルドを確認

```bash
cd /path/to/zenn-qiita-sync/mcp-server
npm run clean
npm run build
```

#### 3. サーバーを直接テスト

```bash
cd /path/to/zenn-qiita-sync/mcp-server
node build/index.js
```

正常な場合は何も出力されずに待機状態になります。Ctrl+Cで終了。

#### 4. ログを確認

```bash
# Claude Desktopのログを確認
tail -f ~/Library/Logs/Claude/mcp*.log
```

#### 5. Claude Desktopを完全に再起動

1. Claude Desktopを終了
2. Activity Monitorで`Claude`プロセスが残っていないか確認
3. Claude Desktopを再起動

### エラー別の対処法

#### "Server does not support logging" エラー

最新バージョンのMCPサーバーを使用してください：
```bash
cd mcp-server
npm update @modelcontextprotocol/sdk
npm run build
```

#### "QIITA_TOKEN not set" エラー

1. `.env`ファイルを作成：
```bash
echo "QIITA_TOKEN=your_token_here" > /path/to/zenn-qiita-sync/.env
```

2. または、`claude_desktop_config.json`で環境変数を設定

#### パーミッションエラー

```bash
chmod +x /path/to/zenn-qiita-sync/mcp-server/build/index.js
```

## Cursorでサーバーが認識されない場合

### 解決方法

1. **プロジェクトローカル設定を確認**
   - `.cursor/mcp.json`が存在するか確認
   - プロジェクトルートでCursorを開いているか確認

2. **Cursor Settings > MCPで有効化**
   - サーバーがリストに表示されているか確認
   - 緑色のインジケーターが表示されているか確認

3. **Cursorを再起動**
   - File > Reload Window
   - または完全に再起動

## 一般的な問題

### 記事が見つからない

```bash
# articlesディレクトリを確認
ls -la articles/

# なければ初期化
npm run init
```

### Qiita認証エラー

1. 新しいトークンを生成: https://qiita.com/settings/applications
2. `.env`ファイルを更新
3. MCPサーバーを再起動

### 同期が失敗する

1. ネットワーク接続を確認
2. Qiita APIの制限を確認（1時間に1000リクエストまで）
3. 記事のフォーマットを確認

## デバッグモード

詳細なログを有効にする：

```bash
# MCP Inspectorでテスト
cd mcp-server
npx @modelcontextprotocol/inspector node build/index.js
```

## サポート

解決しない場合は、以下の情報と共にイシューを作成してください：

1. エラーメッセージの全文
2. `claude_desktop_config.json`の内容（トークンは除く）
3. `npm --version`と`node --version`の出力
4. OS情報