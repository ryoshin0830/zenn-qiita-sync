# Zenn-Qiita Sync MCP Server - AIで記事を自動投稿！

## 🤖 MCPサーバーとは？

**MCP（Model Context Protocol）サーバー**は、AIアシスタント（Claude）があなたの代わりにZennとQiitaを操作できるようにする「橋渡し役」です。

### こんなことができます

```
あなた：「TypeScriptについて記事を書いて、ZennとQiitaに投稿して」
Claude：「記事を作成して両方に投稿しました！」
```

たったこれだけで、両方のプラットフォームに記事が投稿されます！

### 仕組みの図解

```
┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌────────┐
│ あなた  │ --> │ Claude  │ --> │ MCPサーバー  │ --> │ Zenn   │
└─────────┘     └─────────┘     └──────────────┘     │ Qiita  │
                                                       └────────┘
```

1. **あなた**がClaudeに話しかける
2. **Claude**がMCPサーバーに指示を送る
3. **MCPサーバー**がZenn/Qiitaを操作
4. 記事が自動で投稿される！

## 🎯 必要な準備（5つのステップ）

### 必要なアカウント
- ✅ **GitHubアカウント**（Zenn連携用）
- ✅ **Zennアカウント**
- ✅ **Qiitaアカウント**
- ✅ **Claude Desktop**

### 必要なソフトウェア
- ✅ **Node.js v18以上**
- ✅ **Git**

## 📝 ステップ1: ZennとGitHubの連携設定

### 1-1. GitHubでリポジトリを作成

Zennは**GitHubのリポジトリに記事を保存**する仕組みです。まずリポジトリを作りましょう。

1. **[GitHub](https://github.com)にログイン**

2. **新しいリポジトリを作成**
   - 右上の「➕」ボタン → 「New repository」をクリック
   
3. **以下の設定で作成**
   ```
   Repository name: zenn-content（または好きな名前）
   Description: Zennの記事を管理
   Public: ◉ （必ずPublicを選択！）
   Initialize with README: ☐ （チェックしない）
   ```
   
   ![GitHubリポジトリ作成](https://via.placeholder.com/600x400?text=GitHub+Repository+Creation)

4. **「Create repository」をクリック**

### 1-2. ZennとGitHubを連携

1. **[Zenn](https://zenn.dev)にログイン**

2. **GitHubと連携**
   - 右上のアイコン → 「GitHub からのデプロイ」
   - 「リポジトリを連携する」をクリック
   
3. **先ほど作ったリポジトリを選択**
   - `zenn-content`を選択
   - 「連携する」をクリック
   
   ![Zenn GitHub連携](https://via.placeholder.com/600x400?text=Zenn+GitHub+Integration)

### 1-3. リポジトリをローカルに準備

ターミナル（Mac）またはコマンドプロンプト（Windows）を開いて：

```bash
# デスクトップに移動
cd ~/Desktop  # Mac
cd C:\Users\あなたの名前\Desktop  # Windows

# リポジトリをクローン（ダウンロード）
git clone https://github.com/あなたのGitHubユーザー名/zenn-content.git
cd zenn-content
```

## 🔑 ステップ2: Qiita APIトークンの取得

Qiitaは**APIトークン**で記事を投稿します。

1. **[Qiita](https://qiita.com)にログイン**

2. **設定画面へ**
   - 右上のアイコン → 「設定」

3. **アプリケーションタブ**
   - 左メニューの「アプリケーション」をクリック

4. **新しいトークンを発行**
   ```
   アクセストークンの説明: Zenn-Qiita Sync
   スコープ:
   ☑ read_qiita （読み取り）
   ☑ write_qiita （書き込み）
   ```
   
   ![Qiita Token](https://via.placeholder.com/600x400?text=Qiita+Token+Settings)

5. **「発行する」をクリック**
   - 🚨 **表示されたトークンを必ずコピーして保存！**（二度と表示されません）

## 💻 ステップ3: MCPサーバーのインストール

### 3-1. プロジェクトをダウンロード

```bash
# zenn-contentフォルダにいることを確認
pwd
# 出力例: /Users/あなた/Desktop/zenn-content

# MCPサーバーをダウンロード
git clone https://github.com/your-repo/zenn-qiita-sync.git
cd zenn-qiita-sync
```

### 3-2. 必要なパッケージをインストール

```bash
# メインプロジェクト
npm install

# MCPサーバー
cd mcp-server
npm install
npm run build
```

### 3-3. 環境変数を設定

```bash
# プロジェクトルートに戻る
cd ..

# .envファイルを作成
echo "QIITA_TOKEN=ここに先ほどコピーしたトークン" > .env
```

## 🔧 ステップ4: Claude Desktopの設定

### 4-1. Claude Desktopをインストール

1. [Claude Desktop](https://claude.ai/download)をダウンロード
2. 通常のアプリと同じようにインストール

### 4-2. MCPサーバーを登録

#### Mac の場合

1. **設定ファイルを作成**
```bash
mkdir -p ~/Library/Application\ Support/Claude
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. **以下の内容を入力**（既存の内容があれば置き換え）
```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": ["/Users/あなたのユーザー名/Desktop/zenn-content/zenn-qiita-sync/mcp-server/build/index.js"],
      "env": {
        "QIITA_TOKEN": "取得したQiitaトークンをここに"
      }
    }
  }
}
```

3. **保存して終了**
   - `Ctrl + X` → `Y` → `Enter`

#### Windows の場合

1. **設定フォルダを開く**
   - `Win + R`で「ファイル名を指定して実行」
   - `%APPDATA%\Claude`と入力してEnter

2. **claude_desktop_config.jsonを作成**
   - 右クリック → 新規作成 → テキストドキュメント
   - ファイル名を`claude_desktop_config.json`に変更

3. **メモ帳で開いて以下を入力**
```json
{
  "mcpServers": {
    "zenn-qiita-sync": {
      "command": "node",
      "args": ["C:\\Users\\あなたのユーザー名\\Desktop\\zenn-content\\zenn-qiita-sync\\mcp-server\\build\\index.js"],
      "env": {
        "QIITA_TOKEN": "取得したQiitaトークンをここに"
      }
    }
  }
}
```

### 4-3. パスの確認方法

正しいパスがわからない場合：

```bash
# MCPサーバーのbuildフォルダに移動
cd ~/Desktop/zenn-content/zenn-qiita-sync/mcp-server/build

# 現在のパスを表示
pwd  # Mac
cd   # Windows（何も引数なしで実行）

# 表示されたパスに /index.js を追加したものを使用
```

## ✅ ステップ5: 動作確認

### 5-1. Claude Desktopを再起動

1. Claude Desktopを完全に終了
   - Mac: `Cmd + Q`
   - Windows: `Alt + F4`
2. もう一度起動

### 5-2. 初期化

Claude Desktopで：
```
「ZennとQiitaを初期化して」
```

成功メッセージが表示されればOK！

### 5-3. テスト投稿

```
「テスト記事を作成して。タイトルは"Hello World"、絵文字は👋、トピックはtest」
```

## 🚀 使い方

### 基本コマンド

| やりたいこと | Claudeに話しかける内容 |
|------------|---------------------|
| 記事作成 | 「〇〇について記事を作成して」 |
| 記事編集 | 「さっきの記事に△△を追加して」 |
| 投稿 | 「記事を投稿して」 |
| Zenn公開 | 「Zennに公開して」 |
| 一覧表示 | 「記事の一覧を見せて」 |

### 実際の使用例

```
あなた：「Reactフックについて初心者向けの記事を書いて」

Claude：「Reactフックについての記事を作成します...」
（記事作成）

あなた：「良さそう！両方のプラットフォームに投稿して」

Claude：「記事を投稿しました！
- Zenn: https://zenn.dev/articles/xxxxx
- Qiita: https://qiita.com/items/xxxxx」

あなた：「Zennにも公開して」

Claude：「GitHubにプッシュしました。Zennで公開されます。」
```

## 🆘 トラブルシューティング

### よくある問題

#### 「ツールが使えません」
- Claude Desktopを再起動
- 設定ファイルのパスを確認
- ログを確認：
  ```bash
  # Mac
  tail -f ~/Library/Logs/Claude/mcp-server-zenn-qiita-sync.log
  ```

#### 「Qiitaに投稿できない」
- APIトークンが正しいか確認
- トークンの権限（read_qiita, write_qiita）を確認

#### 「Zennに公開されない」
- GitHubのユーザー設定：
  ```bash
  git config --global user.name "あなたの名前"
  git config --global user.email "your-email@example.com"
  ```

### デバッグ用コマンド

```bash
# Node.jsバージョン確認
node --version

# Gitバージョン確認
git --version

# 現在のディレクトリ確認
pwd

# MCPサーバーのビルド確認
ls mcp-server/build/
```

## 📚 MCPサーバーの詳細

### ツール一覧

| ツール名 | 説明 |
|---------|------|
| init | Zenn/Qiitaを初期化 |
| create_article | 新規記事作成 |
| post_article | 記事投稿 |
| edit_article | 記事編集 |
| delete_article | 記事削除 |
| get_article | 記事取得 |
| sync_articles | 全記事同期 |
| pull_articles | Qiitaから取得 |
| preview | プレビュー表示 |
| publish_zenn | Zennに公開（Git push） |

### ファイル構成

```
zenn-content/
├── articles/           # Zennの記事
├── zenn-qiita-sync/   # MCPサーバー
│   ├── mcp-server/
│   │   ├── src/       # ソースコード
│   │   └── build/     # ビルド済み
│   └── .env           # 環境変数
└── .git/              # Git管理
```

## 🎉 さあ、始めましょう！

設定が完了したら、Claudeに話しかけるだけで記事を管理できます。
技術ブログがもっと楽しくなりますように！

---

**バージョン**: 1.0.0  
**ライセンス**: MIT  
**作者**: Your Name  

困ったときは[GitHubのIssues](https://github.com/your-repo/issues)でお気軽に質問してください！