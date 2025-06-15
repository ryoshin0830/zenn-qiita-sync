# Zenn-Qiita Sync 完全セットアップガイド

## 📖 このガイドについて

このガイドは、**パソコン初心者の方でも確実にセットアップできるよう**、すべての手順を画像付きで詳しく説明しています。

**所要時間**: 約30分〜1時間  
**難易度**: ★☆☆☆☆（初心者向け）

## 📑 目次

1. [はじめに - このプロジェクトでできること](#1-はじめに)
2. [ZennとQiitaの違いを理解しよう](#2-zennとqiitaの違い)
3. [必要なアカウントを作成する](#3-アカウント作成)
4. [必要なソフトウェアをインストールする](#4-ソフトウェアインストール)
5. [GitHubリポジトリを作成してZennと連携する](#5-github-zenn連携)
6. [Qiita APIキーを取得する](#6-qiita-api)
7. [プロジェクトをセットアップする](#7-プロジェクトセットアップ)
8. [MCPサーバーを設定する](#8-mcp-server)
9. [Claude Desktopを設定する](#9-claude-desktop)
10. [動作確認と使い方](#10-使い方)
11. [トラブルシューティング](#11-トラブルシューティング)
12. [付録 - 用語集とコマンド一覧](#12-付録)

---

## 1. はじめに - このプロジェクトでできること {#1-はじめに}

### 🎯 このプロジェクトの目的

**AIアシスタント（Claude）に話しかけるだけで、技術記事をZennとQiitaの両方に自動投稿できるツール**です。

### ✨ できること

1. **AIに頼むだけで記事作成**
   ```
   あなた：「Pythonの基礎について記事を書いて」
   Claude：「記事を作成しました！」
   ```

2. **両方のプラットフォームに同時投稿**
   ```
   あなた：「記事を投稿して」
   Claude：「ZennとQiitaに投稿しました！」
   ```

3. **記事の管理も簡単**
   - 記事の編集
   - 記事の削除
   - 下書き保存
   - 公開/非公開の切り替え

### 🔧 仕組みの概要

```
あなた ←→ Claude ←→ MCPサーバー ←→ Zenn/Qiita
```

**MCP（Model Context Protocol）サーバー**が、ClaudeとZenn/Qiitaの橋渡しをします。

---

## 2. ZennとQiitaの違いを理解しよう {#2-zennとqiitaの違い}

### 📝 Zennとは

**Zenn**は、エンジニアのための情報共有コミュニティです。

#### Zennの特徴
- **GitHubと連携**して記事を管理
- 記事は**Markdownファイル**として保存
- **git push**すると自動的に公開
- 投げ銭機能あり

#### Zennの仕組み
```
1. GitHubリポジトリに記事を保存
2. git pushでGitHubに送信
3. Zennが自動的に記事を公開
```

### 📝 Qiitaとは

**Qiita**は、プログラマのための技術情報共有サービスです。

#### Qiitaの特徴
- **API**を使って記事を投稿
- Webサイト上で直接編集も可能
- LGTM（いいね）機能
- ストック機能

#### Qiitaの仕組み
```
1. APIキーで認証
2. APIを通じて記事を送信
3. すぐに公開される
```

### 🤔 なぜ両方に投稿するの？

- **読者層が異なる**：より多くの人に届く
- **それぞれの強みを活用**：Zennの投げ銭、QiitaのLGTM
- **バックアップ**：片方が使えなくても大丈夫

---

## 3. 必要なアカウントを作成する {#3-アカウント作成}

### 📋 必要なアカウント一覧

- [ ] GitHubアカウント（無料）
- [ ] Zennアカウント（無料）
- [ ] Qiitaアカウント（無料）
- [ ] Claudeアカウント（無料）

### 3-1. GitHubアカウントの作成

1. **[GitHub](https://github.com)にアクセス**

2. **「Sign up」をクリック**
   ![GitHub Sign up](https://via.placeholder.com/800x400?text=GitHub+Sign+up+Button)

3. **必要事項を入力**
   - **Username**（ユーザー名）: 半角英数字で好きな名前
   - **Email**（メールアドレス）: 受信できるメールアドレス
   - **Password**（パスワード）: 15文字以上または8文字以上で数字と小文字を含む

4. **メール認証**
   - 登録したメールアドレスに確認メールが届きます
   - メール内のリンクをクリックして認証完了

### 3-2. Zennアカウントの作成

1. **[Zenn](https://zenn.dev)にアクセス**

2. **「GitHubでログイン」をクリック**
   ![Zenn Login](https://via.placeholder.com/800x400?text=Zenn+GitHub+Login)

3. **GitHubとの連携を許可**
   - 「Authorize zenn-dev」をクリック

4. **プロフィールを設定**
   - ユーザー名を設定（後で変更可能）

### 3-3. Qiitaアカウントの作成

1. **[Qiita](https://qiita.com)にアクセス**

2. **「ユーザー登録」をクリック**
   ![Qiita Sign up](https://via.placeholder.com/800x400?text=Qiita+Sign+up)

3. **登録方法を選択**
   - メールアドレスで登録
   - またはGitHub/Twitter/Googleアカウントで登録

4. **必要事項を入力**
   - ユーザー名
   - メールアドレス
   - パスワード

### 3-4. Claude Desktopのインストール

1. **[Claude Desktop](https://claude.ai/download)にアクセス**

2. **お使いのOSに合わせてダウンロード**
   - Windows版
   - Mac版

3. **インストール**
   - ダウンロードしたファイルをダブルクリック
   - 指示に従ってインストール

---

## 4. 必要なソフトウェアをインストールする {#4-ソフトウェアインストール}

### 📋 必要なソフトウェア

- [ ] Node.js（バージョン18以上）
- [ ] Git
- [ ] テキストエディタ（VS Code推奨）

### 4-1. Node.jsのインストール

#### Windowsの場合

1. **[Node.js公式サイト](https://nodejs.org/ja/)にアクセス**

2. **LTS版をダウンロード**
   - 「〇〇.〇〇.〇 LTS 推奨版」をクリック
   ![Node.js Download](https://via.placeholder.com/800x400?text=Node.js+LTS+Download)

3. **インストーラーを実行**
   - ダウンロードした`.msi`ファイルをダブルクリック
   - 「Next」を押していく（デフォルト設定でOK）
   - 「Install」をクリック

4. **インストール確認**
   - コマンドプロンプトを開く（Windowsキー + R → cmd → Enter）
   - 以下を入力：
   ```cmd
   node --version
   ```
   - `v18.0.0`以上が表示されればOK

#### Macの場合

1. **ターミナルを開く**
   - Spotlight検索（Command + Space）で「ターミナル」と入力

2. **Homebrewをインストール**（すでにある場合はスキップ）
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Node.jsをインストール**
   ```bash
   brew install node
   ```

4. **インストール確認**
   ```bash
   node --version
   ```

### 4-2. Gitのインストール

#### Windowsの場合

1. **[Git公式サイト](https://git-scm.com/)にアクセス**

2. **「Download for Windows」をクリック**

3. **インストーラーを実行**
   - デフォルト設定でOK
   - 「Next」を押していく
   - 「Install」をクリック

4. **Git Bashを開いて確認**
   ```bash
   git --version
   ```

#### Macの場合

1. **ターミナルで以下を実行**
   ```bash
   brew install git
   ```

2. **確認**
   ```bash
   git --version
   ```

### 4-3. VS Codeのインストール（推奨）

1. **[VS Code公式サイト](https://code.visualstudio.com/)にアクセス**

2. **ダウンロード**
   - お使いのOSに合わせてダウンロード

3. **インストール**
   - ダウンロードしたファイルを実行
   - 指示に従ってインストール

---

## 5. GitHubリポジトリを作成してZennと連携する {#5-github-zenn連携}

### 5-1. GitHubでリポジトリを作成

1. **[GitHub](https://github.com)にログイン**

2. **新しいリポジトリを作成**
   - 右上の「+」ボタンをクリック
   - 「New repository」を選択
   ![GitHub New Repo](https://via.placeholder.com/800x400?text=GitHub+New+Repository)

3. **リポジトリの設定**
   ```
   Repository name: zenn-content
   Description: Zennの記事を管理するリポジトリ
   Public: ◉ （必ずPublicを選択！）
   Initialize this repository with:
   □ Add a README file（チェックしない）
   □ Add .gitignore（チェックしない）
   □ Choose a license（チェックしない）
   ```

4. **「Create repository」をクリック**

5. **作成されたURLをメモ**
   - `https://github.com/あなたのユーザー名/zenn-content`

### 5-2. Zennと連携

1. **[Zenn](https://zenn.dev)にログイン**

2. **GitHubリポジトリと連携**
   - 画面右上のアイコンをクリック
   - 「GitHubからのデプロイ」を選択
   ![Zenn GitHub Deploy](https://via.placeholder.com/800x400?text=Zenn+GitHub+Deploy+Menu)

3. **リポジトリを連携**
   - 「リポジトリを連携する」をクリック
   - 先ほど作成した`zenn-content`を選択
   - 「連携する」をクリック

4. **連携完了の確認**
   - 「連携済みリポジトリ」に表示されればOK

### 5-3. リポジトリをローカルにクローン

1. **作業フォルダを決める**
   - デスクトップがおすすめ

2. **ターミナル（Mac）またはコマンドプロンプト（Windows）を開く**

3. **デスクトップに移動**
   ```bash
   # Mac
   cd ~/Desktop

   # Windows
   cd %USERPROFILE%\Desktop
   ```

4. **リポジトリをクローン**
   ```bash
   git clone https://github.com/あなたのユーザー名/zenn-content.git
   ```

5. **フォルダに移動**
   ```bash
   cd zenn-content
   ```

6. **Gitの初期設定**（初めての場合）
   ```bash
   git config --global user.name "あなたの名前"
   git config --global user.email "your-email@example.com"
   ```

---

## 6. Qiita APIキーを取得する {#6-qiita-api}

### 6-1. Qiitaの設定画面へ

1. **[Qiita](https://qiita.com)にログイン**

2. **設定画面を開く**
   - 右上のプロフィールアイコンをクリック
   - 「設定」を選択
   ![Qiita Settings](https://via.placeholder.com/800x400?text=Qiita+Settings+Menu)

### 6-2. アクセストークンを発行

1. **「アプリケーション」タブをクリック**
   - 左側のメニューから選択

2. **「新しいトークンを発行する」をクリック**

3. **トークンの設定**
   ```
   アクセストークンの説明: Zenn-Qiita Sync
   
   スコープ（権限）:
   ☑ read_qiita（Qiitaからの読み取り）
   ☑ write_qiita（Qiitaへの書き込み）
   □ read_qiita_team（チェック不要）
   □ write_qiita_team（チェック不要）
   ```

4. **「発行する」をクリック**

5. **トークンをコピーして保存**
   - ⚠️ **重要**: このトークンは**二度と表示されません**
   - 必ずどこかに保存してください（メモ帳など）
   - 例: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 6-3. トークンの保管

**安全な場所に保存してください：**
- メモ帳に保存
- パスワードマネージャーに保存
- **絶対に他人に教えない**

---

## 7. プロジェクトをセットアップする {#7-プロジェクトセットアップ}

### 7-1. プロジェクトをダウンロード

1. **ターミナル/コマンドプロンプトを開く**

2. **zenn-contentフォルダにいることを確認**
   ```bash
   pwd  # Mac/Linux
   cd   # Windows（現在地が表示される）
   ```
   - `/Users/あなた/Desktop/zenn-content`のように表示されるはず

3. **Zenn-Qiita Syncをダウンロード**
   ```bash
   git clone https://github.com/shin-mcp/zenn-qiita-sync.git
   cd zenn-qiita-sync
   ```

### 7-2. 必要なパッケージをインストール

1. **メインプロジェクトのセットアップ**
   ```bash
   npm install
   ```
   - 少し時間がかかります（1-3分）

2. **MCPサーバーのセットアップ**
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

3. **ビルドの確認**
   ```bash
   # buildフォルダが作成されているか確認
   ls build/  # Mac/Linux
   dir build  # Windows
   ```
   - `index.js`などのファイルが表示されればOK

### 7-3. 環境変数の設定

1. **プロジェクトルートに戻る**
   ```bash
   cd ..
   ```

2. **.envファイルを作成**
   ```bash
   # Mac/Linux
   echo "QIITA_TOKEN=ここに先ほどコピーしたトークン" > .env

   # Windows
   echo QIITA_TOKEN=ここに先ほどコピーしたトークン > .env
   ```

3. **確認**
   ```bash
   # Mac/Linux
   cat .env

   # Windows
   type .env
   ```
   - `QIITA_TOKEN=a1b2c3d4...`のように表示されればOK

---

## 8. MCPサーバーを設定する {#8-mcp-server}

### 8-1. MCPサーバーとは

**MCP（Model Context Protocol）サーバー**は、ClaudeがZenn/Qiitaを操作できるようにする仲介役です。

```
Claude ←→ MCPサーバー ←→ Zenn/Qiita
```

### 8-2. 設定ファイルのパスを確認

1. **MCPサーバーのパスを確認**
   ```bash
   cd ~/Desktop/zenn-content/zenn-qiita-sync/mcp-server/build
   pwd  # Mac/Linux
   cd   # Windows
   ```

2. **表示されたパスをメモ**
   - Mac: `/Users/あなたのユーザー名/Desktop/zenn-content/zenn-qiita-sync/mcp-server/build`
   - Windows: `C:\Users\あなたのユーザー名\Desktop\zenn-content\zenn-qiita-sync\mcp-server\build`

3. **最後に`/index.js`を追加**
   - Mac: `/Users/.../build/index.js`
   - Windows: `C:\...\build\index.js`

---

## 9. Claude Desktopを設定する {#9-claude-desktop}

### 9-1. 設定ファイルの場所

#### Macの場合

1. **Finderを開く**

2. **「移動」メニュー → 「フォルダへ移動」**
   - または `Command + Shift + G`

3. **以下を入力**
   ```
   ~/Library/Application Support/Claude
   ```

4. **フォルダが開く**

#### Windowsの場合

1. **「ファイル名を指定して実行」を開く**
   - `Windows + R`

2. **以下を入力**
   ```
   %APPDATA%\Claude
   ```

3. **フォルダが開く**

### 9-2. 設定ファイルを作成

1. **新しいファイルを作成**
   - 右クリック → 新規作成 → テキストドキュメント
   - ファイル名: `claude_desktop_config.json`
   - ⚠️ 拡張子が`.json`になっていることを確認

2. **ファイルを開く**
   - VS Codeまたはメモ帳で開く

3. **以下の内容をコピー＆ペースト**

   **Macの場合：**
   ```json
   {
     "mcpServers": {
       "zenn-qiita-sync": {
         "command": "node",
         "args": ["/Users/あなたのユーザー名/Desktop/zenn-content/zenn-qiita-sync/mcp-server/build/index.js"],
         "env": {
           "QIITA_TOKEN": "取得したトークンをここに"
         }
       }
     }
   }
   ```

   **Windowsの場合：**
   ```json
   {
     "mcpServers": {
       "zenn-qiita-sync": {
         "command": "node",
         "args": ["C:\\Users\\あなたのユーザー名\\Desktop\\zenn-content\\zenn-qiita-sync\\mcp-server\\build\\index.js"],
         "env": {
           "QIITA_TOKEN": "取得したトークンをここに"
         }
       }
     }
   }
   ```

4. **必ず変更する箇所**
   - `あなたのユーザー名` → 実際のユーザー名
   - `取得したトークンをここに` → Qiitaのトークン

5. **保存**
   - `Ctrl + S`（Windows）
   - `Command + S`（Mac）

### 9-3. Claude Desktopを再起動

1. **Claude Desktopを完全に終了**
   - Mac: `Command + Q`
   - Windows: タスクバーのアイコンを右クリック → 終了

2. **再度起動**
   - デスクトップのアイコンをダブルクリック

---

## 10. 動作確認と使い方 {#10-使い方}

### 10-1. 初期設定の確認

1. **Claude Desktopを開く**

2. **初期化コマンドを実行**
   ```
   ZennとQiitaを初期化して
   ```

3. **成功メッセージを確認**
   - 「Successfully initialized both Zenn and Qiita CLIs」と表示されればOK

### 10-2. テスト記事の作成

1. **簡単な記事を作成**
   ```
   テスト記事を作成して。
   タイトルは「はじめての投稿」
   絵文字は🎉
   トピックは「test」
   ```

2. **作成完了を確認**
   - 「Article created successfully!」と表示される
   - slugが表示される（例: `abc123`）

### 10-3. 基本的な使い方

#### 記事を書く
```
Pythonの基礎について初心者向けの記事を書いて
```

#### 記事を編集
```
さっきの記事に、リストの使い方を追加して
```

#### 両方に投稿
```
記事を投稿して
```

#### Zennに公開（Git push）
```
Zennに公開して
```

### 10-4. 便利な機能

#### 記事一覧
```
記事の一覧を見せて
```

#### 特定の記事を編集
```
slug: abc123の記事を編集して
```

#### 下書き保存
```
記事を作成して、でもまだ公開しないで
```

---

## 11. トラブルシューティング {#11-トラブルシューティング}

### よくあるエラーと対処法

#### 「ツールが使えません」と表示される

**原因**: MCPサーバーが認識されていない

**対処法**:
1. Claude Desktopを完全に終了して再起動
2. 設定ファイルのパスを確認
3. Node.jsが正しくインストールされているか確認
   ```bash
   node --version
   ```

#### 「Qiitaに投稿できません」

**原因**: APIトークンが間違っている

**対処法**:
1. トークンが正しくコピーされているか確認
2. トークンの前後に余計なスペースがないか確認
3. トークンの権限（read_qiita, write_qiita）を確認

#### 「Zennに公開されません」

**原因**: Gitの設定が不完全

**対処法**:
1. GitHubにログインできているか確認
2. リポジトリがPublicになっているか確認
3. Git設定を確認
   ```bash
   git config --list
   ```

### ログの確認方法

#### Mac
```bash
tail -f ~/Library/Logs/Claude/mcp-server-zenn-qiita-sync.log
```

#### Windows
```cmd
type "%LOCALAPPDATA%\Claude\Logs\mcp-server-zenn-qiita-sync.log"
```

### 手動での動作確認

1. **Zennの記事フォルダを確認**
   ```bash
   ls articles/  # Mac/Linux
   dir articles  # Windows
   ```

2. **Gitの状態を確認**
   ```bash
   git status
   ```

3. **手動でコミット&プッシュ**
   ```bash
   git add .
   git commit -m "test"
   git push origin main
   ```

---

## 12. 付録 - 用語集とコマンド一覧 {#12-付録}

### 用語集

| 用語 | 説明 |
|-----|------|
| **MCP** | Model Context Protocol - AIと外部ツールをつなぐ仕組み |
| **API** | Application Programming Interface - プログラム同士が通信する仕組み |
| **トークン** | 認証用の文字列（パスワードのようなもの） |
| **リポジトリ** | Gitでファイルを管理する保管庫 |
| **クローン** | リポジトリをローカルにコピーすること |
| **コミット** | 変更を記録すること |
| **プッシュ** | 変更をGitHubに送信すること |
| **Markdown** | 文章を書くための記法 |
| **slug** | 記事のID（ファイル名） |

### よく使うコマンド

#### 基本コマンド
```bash
# 現在の場所を確認
pwd  # Mac/Linux
cd   # Windows

# フォルダの中身を見る
ls   # Mac/Linux  
dir  # Windows

# フォルダを移動
cd フォルダ名

# 一つ上のフォルダに移動
cd ..
```

#### Gitコマンド
```bash
# 状態確認
git status

# 変更を追加
git add .

# コミット
git commit -m "メッセージ"

# プッシュ
git push origin main
```

#### npmコマンド
```bash
# パッケージインストール
npm install

# ビルド
npm run build
```

### ショートカットキー

| 操作 | Windows | Mac |
|------|---------|-----|
| コピー | Ctrl + C | Command + C |
| ペースト | Ctrl + V | Command + V |
| 保存 | Ctrl + S | Command + S |
| 終了 | Alt + F4 | Command + Q |
| ターミナルで実行中止 | Ctrl + C | Control + C |

### 参考リンク

- [Zenn公式ドキュメント](https://zenn.dev/zenn)
- [Qiita API v2ドキュメント](https://qiita.com/api/v2/docs)
- [GitHub Docs](https://docs.github.com/ja)
- [Node.js公式サイト](https://nodejs.org/ja/)
- [Git公式サイト](https://git-scm.com/)

---

## 🎊 おめでとうございます！

セットアップが完了しました！これでClaudeに話しかけるだけで、技術記事を簡単に投稿できます。

**困ったときは：**
- このガイドを見返す
- エラーメッセージで検索
- [GitHubのIssues](https://github.com/your-repo/issues)で質問

**次のステップ：**
1. 実際に記事を書いてみる
2. 便利な機能を試してみる
3. 自分好みにカスタマイズ

楽しい技術ブログライフを！ 🚀