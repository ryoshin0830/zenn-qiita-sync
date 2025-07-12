---
title: Next.js 15 + Prisma + Neonで遭遇したデータベース連携の落とし穴と解決策
emoji: "\U0001F527"
type: tech
topics:
  - nextjs
  - prisma
  - neon
  - database
  - typescript
published: false
---
# はじめに

Next.js 15のApp RouterとPrisma、Neon（PostgreSQL）を組み合わせたWebアプリケーション開発中に遭遇した、いくつかの技術的な課題とその解決策を共有します。特に、データベースのフィールド追加時のAPI連携やVercelのプレビュー環境での問題など、実際の開発で躓きやすいポイントをまとめました。

# 1. Prismaでフィールドを追加したのにAPIで値が返ってこない問題

## 問題の概要

Prismaスキーマに新しいフィールドを追加し、データベースに値も保存されているにもかかわらず、GET APIで値が返ってこないという問題に遭遇しました。

```prisma
model Content {
  id            String   @id @default(cuid())
  title         String
  text          String   @db.Text
  wordCount     Int?     // 新規追加
  characterCount Int?    // 新規追加
  // ... 他のフィールド
}
```

## 原因

APIのGETエンドポイントで、新しく追加したフィールドをレスポンスに含めていなかったことが原因でした。

```typescript
// 修正前
const formattedContent = {
  id: content.id,
  title: content.title,
  text: content.text,
  // wordCountとcharacterCountが抜けている！
};
```

## 解決策

GET APIのレスポンスに新しいフィールドを追加：

```typescript
// 修正後
const formattedContent = {
  id: content.id,
  title: content.title,
  text: content.text,
  wordCount: content.wordCount,      // 追加
  characterCount: content.characterCount, // 追加
};
```

**ポイント**: Prismaでスキーマを変更した後は、以下を確認しましょう：
1. `prisma generate`でクライアントを再生成
2. `prisma db push`でデータベースに反映
3. **APIのレスポンス形式も更新する**（忘れがち！）

# 2. Vercelプレビュー環境でデータベース接続エラーが発生する問題

## 問題の概要

ローカル環境では正常に動作するのに、Vercelのプレビュー環境で「コンテンツの取得に失敗しました」というエラーが発生。

## 原因

Vercelのビルドプロセスでデータベーススキーマが同期されていないことが原因でした。

## 解決策

`package.json`のビルドスクリプトを修正：

```json
{
  "scripts": {
    "build": "prisma generate && prisma db push --skip-generate && next build"
  }
}
```

これにより、Vercelのビルド時に自動的に：
1. Prismaクライアントを生成
2. データベーススキーマを同期
3. Next.jsアプリケーションをビルド

# 3. ExcelファイルアップロードAPIで400エラーが発生する問題

## 問題の概要

Next.js 15のApp RouterでExcelファイルアップロードAPIを実装した際、Vercel環境で400エラーが発生。

## 解決策

詳細なエラーハンドリングとログを追加：

```typescript
export const runtime = 'nodejs'; // Node.jsランタイムを明示的に指定

export async function POST(request: Request) {
  try {
    // Content-Typeの検証
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // FormDataの解析
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('FormData parse error:', error);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }

    // ファイルの検証
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file object' },
        { status: 400 }
      );
    }

    // ファイル処理...
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
```

# 4. Neonデータベースのブランチ制限に引っかかる問題

## 問題の概要

Vercelのプレビューデプロイ時に「You reached to your branch limit」というエラーが発生。

## 原因

Neonの無料プランでは、プロジェクトあたり10個のデータベースブランチまでという制限があります。VercelとNeonの統合により、GitブランチごとにデータベースブランチがC自動作成されるため、この制限に達してしまいました。

## 解決策

1. **Neonコンソールで不要なブランチを削除**
   - マージ済みのPRに対応するデータベースブランチを削除
   - 古いプレビュー環境のブランチを削除

2. **自動ブランチ作成の制御**（オプション）
   - 特定のブランチのみデータベースブランチを作成するよう設定

# まとめ

Next.js 15 + Prisma + Neonの組み合わせは強力ですが、以下の点に注意が必要です：

1. **APIレスポンスの更新を忘れずに** - Prismaスキーマ変更時
2. **ビルドプロセスでのDB同期** - Vercel環境での動作確保
3. **詳細なエラーハンドリング** - 本番環境でのデバッグを容易に
4. **リソース制限の把握** - 無料プランの制限を理解して運用

これらのポイントを押さえることで、よりスムーズな開発が可能になります。

# 参考リンク

- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel + Neon Integration](https://vercel.com/integrations/neon)
