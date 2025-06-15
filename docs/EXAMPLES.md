# Zenn-Qiita Sync 実践的な使用例集

このドキュメントでは、Zenn-Qiita Sync MCPサーバーの実践的な使用例を紹介します。

## 📝 記事作成フロー

### 1. アイデアから記事作成まで

**シナリオ**: 新しい技術について学んだことを記事にしたい

```
Claude/Cursor: 「Rustの所有権システムについて学んだことを記事にしたいです。初心者向けの内容で、実際のコード例を含めたいです。」

アシスタント: 記事を作成します。

実行するツール: create_article
パラメータ:
- title: "Rustの所有権を理解する：初心者向け完全ガイド"
- emoji: "🦀"
- type: "tech"
- topics: ["Rust", "プログラミング", "メモリ管理"]

記事が作成されました！
slug: rust-ownership-guide
パス: articles/rust-ownership-guide.md

次のステップ:
1. articles/rust-ownership-guide.md を編集して内容を追加
2. 編集が完了したら「slug: rust-ownership-guide を投稿して」と指示
```

### 2. 記事の編集と投稿

**シナリオ**: 記事を書き終えて、両プラットフォームに投稿したい

```
Claude/Cursor: 「rust-ownership-guideの記事を書き終えました。ZennとQiitaの両方に投稿してください。」

アシスタント: 記事を両プラットフォームに投稿します。

実行するツール: post_article
パラメータ:
- slug: "rust-ownership-guide"
- updateIfExists: false

投稿が完了しました！
Zenn: https://zenn.dev/articles/rust-ownership-guide
Qiita: https://qiita.com/items/xxxxxxxxxxxxx
```

### 3. 記事の更新

**シナリオ**: 公開済みの記事に誤字を見つけて修正したい

```
Claude/Cursor: 「rust-ownership-guideの記事を修正しました。両方のプラットフォームで更新してください。」

アシスタント: 記事を更新します。

実行するツール: post_article
パラメータ:
- slug: "rust-ownership-guide"
- updateIfExists: true

更新が完了しました！
```

## 🔄 同期管理フロー

### 1. 初回の一括同期

**シナリオ**: Zennで書いた記事をすべてQiitaにも公開したい

```
Claude/Cursor: 「Zennに10個の記事があります。すべてQiitaにも同期してください。」

アシスタント: すべての記事を同期します。

実行するツール: sync_articles
パラメータ:
- forceUpdate: false

同期が完了しました！
合計: 10記事
成功: 8記事
スキップ: 2記事（既に同期済み）
失敗: 0記事
```

### 2. 定期的な同期

**シナリオ**: 毎週月曜日に新しい記事だけを同期したい

```
Claude/Cursor: 「先週書いた新しい記事だけをQiitaに同期してください。」

アシスタント: 新しい記事を確認して同期します。

実行するツール: sync_articles
パラメータ:
- forceUpdate: false

同期が完了しました！
合計: 15記事
成功: 3記事（新規）
スキップ: 12記事（既に同期済み）
失敗: 0記事
```

## 📊 記事管理フロー

### 1. 記事一覧と状態確認

**シナリオ**: 現在の記事の状態を把握したい

```
Claude/Cursor: 「現在の記事一覧と同期状態を見せてください。」

アシスタント: 記事一覧を取得します。

実行するリソース: articles://list

記事一覧:
1. ✅ Rustの所有権を理解する：初心者向け完全ガイド
   - 状態: 同期済み
   - Zenn: 公開中
   - Qiita: 公開中

2. ⚠️ TypeScriptの型パズル入門
   - 状態: 未同期
   - Zenn: 公開中
   - Qiita: 未投稿

3. 📝 Docker入門ガイド
   - 状態: 下書き
   - Zenn: 非公開
   - Qiita: 未投稿
```

### 2. 特定の記事の検索

**シナリオ**: TypeScript関連の記事を探したい

```
Claude/Cursor: 「TypeScriptに関する記事を探してください。」

アシスタント: TypeScript関連の記事を検索します。

見つかった記事:
1. TypeScriptの型パズル入門 (未同期)
2. React + TypeScript実践ガイド (同期済み)
3. TypeScript 5.0の新機能まとめ (同期済み)
```

## 🚀 高度な使用例

### 1. シリーズ記事の一括作成

**シナリオ**: 連載記事を計画的に作成したい

```
Claude/Cursor: 「『モダンJavaScript完全ガイド』というシリーズで5部構成の記事を作成してください。」

アシスタント: シリーズ記事を作成します。

作成する記事:
1. 第1回: ES6+の基本機能
2. 第2回: 非同期処理とPromise
3. 第3回: モジュールシステム
4. 第4回: 関数型プログラミング
5. 第5回: パフォーマンス最適化

[5つの記事を順番に作成...]

シリーズ記事の作成が完了しました！
各記事を編集後、個別に投稿するか、一括で同期できます。
```

### 2. 記事のバックアップとリストア

**シナリオ**: 重要な記事をバックアップしたい

```
Claude/Cursor: 「すべての公開記事の情報をバックアップ用に出力してください。」

アシスタント: 記事情報とマッピング情報を取得します。

バックアップ情報:
[記事一覧とマッピング情報をJSON形式で出力]

この情報を保存しておけば、必要に応じてリストアできます。
```

### 3. 条件付き一括操作

**シナリオ**: 特定のトピックの記事だけを操作したい

```
Claude/Cursor: 「Dockerに関する記事で、まだQiitaに投稿していないものだけを投稿してください。」

アシスタント: 条件に合う記事を検索して投稿します。

検索結果:
- Docker入門ガイド (未同期)
- Dockerfileベストプラクティス (未同期)

これらの記事を投稿します...
```

## 🛠️ トラブルシューティング例

### 1. 同期エラーの対処

```
Claude/Cursor: 「記事の同期でエラーが発生しました。状態を確認してください。」

アシスタント: エラーの詳細を確認します。

確認内容:
1. 同期マッピングの整合性
2. 各プラットフォームの記事状態
3. APIトークンの有効性

問題: Qiitaの記事IDが変更されているようです。
解決策: 強制更新で再同期を実行します。
```

### 2. 記事の不整合解消

```
Claude/Cursor: 「Zennでは公開済みなのに、Qiitaでは下書きのままの記事があります。修正してください。」

アシスタント: 不整合を確認して修正します。

該当記事: "React Hooks完全ガイド"
- Zenn: 公開済み (published: true)
- Qiita: 下書き (private: true)

Qiitaの記事を公開状態に更新します...
```

## 💡 効率的な運用のコツ

### 1. テンプレートの活用

```
Claude/Cursor: 「いつもの技術記事テンプレートで新しい記事を作成して。タイトルは『GraphQL実装ガイド』で。」

アシスタント: テンプレートを使用して記事を作成します。

テンプレート構成:
- はじめに
- 前提知識
- 実装手順
- コード例
- まとめ
- 参考資料
```

### 2. 定期レポート

```
Claude/Cursor: 「今月の記事投稿状況をまとめてください。」

アシスタント: 今月の活動をまとめます。

2024年3月のレポート:
- 新規作成: 5記事
- 更新: 3記事
- 総PV数: (Zennのみ集計可能)
- 人気記事TOP3:
  1. Rustの所有権を理解する
  2. Docker入門ガイド
  3. TypeScript型パズル
```

### 3. 自動化ワークフロー

```
Claude/Cursor: 「毎回記事を作成するときの手順を教えて。」

アシスタント: 効率的なワークフローを提案します。

推奨ワークフロー:
1. 記事作成: `create_article`でメタデータ設定
2. 執筆: お好みのエディタで編集
3. プレビュー: `preview`で確認
4. 投稿: `post_article`で両方に公開
5. 確認: `articles://list`で状態確認

このフローをスクリプト化することも可能です。
```

## 🔗 他ツールとの連携

### VSCode/Cursorでの執筆フロー

```
1. MCPで記事を作成
2. VSCodeで記事を編集（Markdown Preview Enhanced等を使用）
3. MCPで投稿
4. ブラウザで最終確認
```

### GitHub Actionsとの連携

```yaml
# .github/workflows/sync.yml
name: Weekly Sync
on:
  schedule:
    - cron: '0 9 * * MON'  # 毎週月曜9時
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install and Build
        run: |
          npm install
          npm run mcp:install
          npm run mcp:build
      - name: Sync Articles
        env:
          QIITA_TOKEN: ${{ secrets.QIITA_TOKEN }}
        run: |
          npm run sync
```

これらの例を参考に、自分のワークフローに合わせてカスタマイズしてください！