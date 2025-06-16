---
title: モノレポでPython/TypeScriptのマルチAPI環境を構築する完全ガイド
emoji: "\U0001F680"
type: tech
topics:
  - Python
  - TypeScript
  - FastAPI
  - monorepo
  - pnpm
published: true
---
# はじめに

モダンなWebアプリケーション開発では、フロントエンドとバックエンド、さらに複数のAPIを効率的に管理する必要があります。この記事では、pnpmを使ったモノレポ構成で、Python（FastAPI）とTypeScript（Next.js）を組み合わせた開発環境の構築方法を解説します。

# なぜモノレポ + 複数API構成なのか

## 内部API vs 外部APIの分離

多くのプロジェクトでは、以下の理由でAPIを分離します：

### 内部API（Internal API）
- **用途**: 自社サービスのWebアプリケーション用
- **認証**: JWT、セッション認証など
- **機能**: フル機能（ユーザー管理、データ処理、ファイル管理など）
- **変更**: 自由に変更可能

### 外部API（External API）
- **用途**: サードパーティ連携、他システムとの統合
- **認証**: APIキー認証
- **機能**: 限定的（必要最小限の機能のみ公開）
- **変更**: 後方互換性を維持する必要あり

## モノレポのメリット

1. **コード共有**: 共通ライブラリを簡単に共有
2. **統一管理**: 依存関係を一元管理
3. **開発効率**: 複数プロジェクトをまとめて開発
4. **CI/CD**: 統一されたビルド・デプロイプロセス

# プロジェクト構造

```
project-root/
├── backend/
│   ├── internal/      # 内部API (FastAPI)
│   ├── external/      # 外部API (FastAPI)
│   └── libs/          # 共通ライブラリ
├── front/
│   └── apps/
│       ├── web/       # メインWebアプリ (Next.js)
│       └── admin/     # 管理画面
├── package.json       # ルートパッケージ
├── pnpm-workspace.yaml
└── pyproject.toml     # Python依存関係
```

# 環境構築手順

## 1. 必要なツールのインストール

```bash
# Python環境管理
brew install pyenv
pyenv install 3.10.15
pyenv local 3.10.15

# Python依存関係管理
brew install poetry
poetry config virtualenvs.in-project true

# Node.js環境管理
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 18
echo "18" > .nvmrc

# パッケージマネージャー
npm install -g pnpm
```

## 2. pnpmワークスペースの設定

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'backend/*'
  - 'front/apps/*'
  - 'front/packages/*'
```

## 3. ルートpackage.jsonの設定

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "scripts": {
    "api": "pnpm run --filter internalapi api:local",
    "external-api": "pnpm run --filter externalapi api:local",
    "dev": "turbo run dev --concurrency 20",
    "build": "turbo run build",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.4",
    "typescript": "5.5.4"
  },
  "packageManager": "pnpm@9.6.0"
}
```

## 4. バックエンドの設定

### Internal API (`backend/internal/package.json`)

```json
{
  "name": "internalapi",
  "scripts": {
    "api:local": "poetry run uvicorn internal.main:app --reload --port 8000",
    "migrate": "poetry run alembic upgrade head",
    "test": "poetry run pytest"
  }
}
```

### Poetry設定 (`backend/pyproject.toml`)

```toml
[tool.poetry]
name = "backend"
version = "0.1.0"

[tool.poetry.dependencies]
python = "^3.10"
fastapi = "^0.115.5"
uvicorn = "^0.32.0"
sqlalchemy = "^2.0.0"
alembic = "^1.15.0"
pydantic = "^2.10.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0.0"
pytest-asyncio = "^0.24.0"
```

# FastAPIアーキテクチャパターン

## オニオンアーキテクチャの実装

```
backend/internal/
├── domain/           # ドメインモデル
├── infrastructure/   # データベース、外部サービス
├── presentation/     # リクエスト/レスポンススキーマ
├── usecase/         # ビジネスロジック
├── router/          # APIエンドポイント
└── main.py          # アプリケーションエントリポイント
```

### レイヤーごとの責務

1. **Domain層**: ビジネスエンティティの定義
2. **Infrastructure層**: 永続化、外部サービス連携
3. **UseCase層**: ビジネスロジックの実装
4. **Presentation層**: API入出力の定義
5. **Router層**: HTTPエンドポイントの定義

## CQRSパターンの採用

```python
# Command（書き込み）
class UserCommandUsecase:
    async def create_user(self, data: CreateUserModel) -> UserModel:
        # ユーザー作成ロジック

# Query（読み取り）
class UserQueryUsecase:
    async def get_user(self, user_id: str) -> UserModel:
        # ユーザー取得ロジック
```

# 開発環境の起動手順

## 1. 依存関係のインストール

```bash
# フロントエンド
pnpm i

# バックエンド
cd backend
poetry install
```

## 2. データベースの起動

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
```

```bash
docker-compose up -d postgres
```

## 3. APIサーバーの起動

```bash
# Internal API（ターミナル1）
pnpm api

# External API（ターミナル2）
pnpm external-api
```

## 4. フロントエンドの起動

```bash
# 開発サーバー（ターミナル3）
pnpm dev --filter web
```

# AWS連携時の環境変数管理

## ローカル開発での環境変数

```bash
# AWS認証情報（必要な場合）
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_REGION=ap-northeast-1

# APIサーバー起動
pnpm api
```

## 環境ごとの設定管理

```python
# config.py
import os

ENV = os.environ.get("ENV", "local")

class Config:
    DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://...")
    
    @property
    def is_production(self):
        return ENV == "prod"
```

# セキュリティ考慮事項

## API分離のセキュリティメリット

1. **攻撃対象の限定**: 外部APIへの攻撃が内部システムに影響しない
2. **認証方式の最適化**: 用途に応じた認証方式を選択
3. **レート制限**: APIごとに異なる制限を設定可能
4. **監査ログ**: APIごとに異なるログレベル

## 認証パターンの実装例

### 内部API（JWT認証）
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token = Depends(security)):
    # JWT検証ロジック
    return user
```

### 外部API（APIキー認証）
```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header()):
    if not is_valid_api_key(x_api_key):
        raise HTTPException(status_code=403)
    return True
```

# ベストプラクティス

1. **モノレポでの依存関係管理**
   - ルートで共通依存関係を管理
   - 各プロジェクトで固有の依存関係を定義

2. **環境変数の管理**
   - `.env.local`、`.env.dev`などで環境ごとに分離
   - AWS Systems Managerなどで本番環境の秘密情報を管理

3. **型安全性の確保**
   - PydanticでAPIスキーマを定義
   - TypeScriptで型定義を共有

4. **テスト戦略**
   - 単体テスト: 各レイヤーごと
   - 統合テスト: API全体の動作確認
   - E2Eテスト: フロントエンドとの連携確認

# まとめ

モノレポ構成でPythonとTypeScriptを組み合わせることで：

- **開発効率の向上**: 統一された開発環境
- **保守性の向上**: コードの再利用と一元管理
- **スケーラビリティ**: サービスごとの独立したスケーリング
- **セキュリティ**: 用途に応じた適切な分離

この構成は、小規模なプロジェクトから大規模なエンタープライズアプリケーションまで適用可能です。

# 参考リンク

- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [pnpm公式ドキュメント](https://pnpm.io/)
- [Poetry公式ドキュメント](https://python-poetry.org/)
- [Turborepo公式ドキュメント](https://turbo.build/)
