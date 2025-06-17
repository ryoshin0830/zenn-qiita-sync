---
title: Cursorでdevcontainerを使った快適な開発環境構築ガイド
emoji: "\U0001F680"
type: tech
topics:
  - cursor
  - devcontainer
  - vscode
  - docker
  - 開発環境
published: true
---
# はじめに

近年、開発環境の構築と管理は開発者にとって重要な課題となっています。特にチーム開発では、メンバー間で統一された開発環境を維持することが生産性向上の鍵となります。

本記事では、AI搭載エディタ「Cursor」でdevcontainerを活用し、どこでも同じ開発環境を再現できる方法について解説します。

# devcontainerとは？

devcontainer（Development Container）は、Dockerコンテナを使用して開発環境を定義・共有するための仕組みです。VS Codeで生まれたこの機能は、現在ではCursorを含む多くのエディタでサポートされています。

## devcontainerのメリット

- **環境の再現性**: どのマシンでも同じ開発環境を構築できる
- **依存関係の隔離**: プロジェクトごとに異なるバージョンのツールを使い分けられる
- **セットアップの自動化**: 新しいメンバーがすぐに開発を始められる
- **クリーンな環境**: ホストマシンを汚さない

# Cursorでdevcontainerを使うための準備

## 必要なもの

1. **Cursor**: 最新版をインストール
2. **Docker Desktop**: Windows/Mac/Linuxに対応
3. **Dev Containers拡張機能**: Cursor Extensions Marketplaceからインストール

## Docker Desktopのインストール

```bash
# macOS (Homebrew使用)
brew install --cask docker

# Windows (Chocolatey使用)
choco install docker-desktop

# Linux
# 公式サイトからインストーラーをダウンロード
```

## Dev Containers拡張機能のインストール

1. Cursorを開く
2. 拡張機能アイコン（Ctrl/Cmd + Shift + X）をクリック
3. "Dev Containers"を検索
4. インストールボタンをクリック

# devcontainerの基本設定

## .devcontainer/devcontainer.json の作成

プロジェクトのルートに`.devcontainer`ディレクトリを作成し、`devcontainer.json`を配置します。

```json
{
  "name": "My Project Dev Container",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  
  // コンテナ内で使用するツール
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "18"
    },
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.11"
    },
    "ghcr.io/devcontainers/features/git:1": {}
  },
  
  // インストールする拡張機能
  "customizations": {
    "vscode": {
      "extensions": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "ms-python.python"
      ]
    }
  },
  
  // ポートフォワーディング
  "forwardPorts": [3000, 8000],
  
  // 環境変数
  "remoteEnv": {
    "NODE_ENV": "development"
  },
  
  // コンテナ作成後に実行するコマンド
  "postCreateCommand": "npm install"
}
```

# 実践的なdevcontainer設定例

## Node.js + TypeScriptプロジェクト

```json
{
  "name": "Node.js & TypeScript",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:18",
  
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "prisma.prisma",
        "bradlc.vscode-tailwindcss"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        }
      }
    }
  },
  
  "postCreateCommand": "npm install && npm run build",
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": {
      "label": "Application",
      "onAutoForward": "notify"
    }
  }
}
```

## Python + FastAPIプロジェクト

```json
{
  "name": "Python FastAPI",
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  
  "features": {
    "ghcr.io/devcontainers/features/python:1": {
      "installTools": true,
      "version": "3.11"
    }
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "ms-python.black-formatter",
        "charliermarsh.ruff"
      ],
      "settings": {
        "python.defaultInterpreter": "/usr/local/bin/python",
        "python.formatting.provider": "black",
        "python.linting.enabled": true,
        "python.linting.pylintEnabled": false,
        "python.linting.ruffEnabled": true
      }
    }
  },
  
  "postCreateCommand": "pip install -r requirements.txt",
  "forwardPorts": [8000],
  "remoteUser": "vscode"
}
```

## カスタムDockerfileを使用

`.devcontainer/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# 必要なパッケージをインストール
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    curl \
    git \
    vim \
    postgresql-client

# Rustのインストール例
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# 作業ディレクトリの設定
WORKDIR /workspace
```

# Cursorでdevcontainerを使う手順

## 1. devcontainerで開く

1. Cursorでプロジェクトを開く
2. コマンドパレット（Ctrl/Cmd + Shift + P）を開く
3. "Dev Containers: Reopen in Container"を選択
4. 初回は Docker イメージのビルドが行われる

## 2. 開発作業

コンテナ内で開発を行います。すべての依存関係やツールがコンテナ内にインストールされているため、ホストマシンの環境を気にする必要がありません。

## 3. ポートフォワーディング

devcontainer.jsonで指定したポートは自動的にフォワーディングされます。追加でポートを開く場合：

1. ポートタブを開く
2. "Forward a Port"をクリック
3. ポート番号を入力

# トラブルシューティング

## よくある問題と解決策

### 1. Dockerが起動していない

```bash
# Docker Desktopが起動しているか確認
docker ps

# エラーが出る場合はDocker Desktopを起動
```

### 2. ビルドエラー

```bash
# キャッシュをクリアして再ビルド
docker system prune -a
```

### 3. 拡張機能が動作しない

devcontainer.jsonの`customizations.vscode.extensions`に拡張機能IDが正しく記載されているか確認。

### 4. ファイルの権限問題

```json
{
  "remoteUser": "vscode",
  "containerUser": "vscode",
  "updateRemoteUserUID": true
}
```

# ベストプラクティス

## 1. 軽量なベースイメージを使用

```json
{
  "image": "mcr.microsoft.com/devcontainers/base:alpine"
}
```

## 2. 必要最小限の拡張機能

開発に必要な拡張機能のみをインストールし、起動時間を短縮。

## 3. ボリュームマウントの活用

```json
{
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh,type=bind,readonly"
  ]
}
```

## 4. マルチステージビルド

Dockerfileを使用する場合は、マルチステージビルドで最終イメージサイズを削減。

# チーム開発での活用

## 設定の共有

1. `.devcontainer`ディレクトリをGitリポジトリに含める
2. READMEに devcontainer の使用方法を記載
3. 必要な環境変数はテンプレートファイルで管理

## CI/CDとの連携

```yaml
# GitHub Actions例
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: your-devcontainer-image:latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

# まとめ

Cursorとdevcontainerを組み合わせることで、以下のメリットが得られます：

- **統一された開発環境**: チーム全体で同じ環境を使用
- **迅速なセットアップ**: 新規メンバーのオンボーディング時間を短縮
- **クリーンな環境**: ホストマシンを汚さない
- **AI支援との相性**: Cursorの AI 機能が正確な環境情報を把握

devcontainerは現代の開発において必須のツールとなりつつあります。ぜひプロジェクトに導入して、快適な開発体験を手に入れてください。

# 参考リンク

- [Development Containers Specification](https://containers.dev/)
- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Cursor Documentation](https://cursor.sh/docs)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

この記事が参考になった場合は、ぜひいいねやストックをお願いします！質問やフィードバックもお待ちしています。
