---
title: GitHub ActionsでClaude Codeが「Credit balance is too low」エラーになる問題と対処法
emoji: "\U0001F916"
type: tech
topics:
  - GitHub
  - GitHubActions
  - ClaudeAPI
  - AI
  - エラー対処
published: true
---
# はじめに

GitHub ActionsでClaude Codeを使用していると、突然「Credit balance is too low」というエラーが発生し、ワークフローが失敗することがあります。本記事では、このエラーの原因と対処法について詳しく解説します。

# エラーの概要

## 発生するエラーメッセージ

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."
  }
}
```

このエラーは、Claude APIのクレジット残高が不足している場合に発生します。

## 実際のGitHub Actionsでの表示例

```
Error: Process completed with exit code 1.
Credit balance is too low
```

# エラーの原因

## 1. 実際にクレジット残高が不足している

最も単純な原因は、Anthropic APIのクレジット残高が実際に不足していることです。

## 2. APIキーの設定ミス

GitHub SecretsにAPIキーが正しく設定されていない、または無効なAPIキーを使用している場合もこのエラーが発生します。

## 3. 既知のバグ

実は、十分なクレジット残高があるにも関わらずこのエラーが発生するケースが多数報告されています：

- [Issue #867](https://github.com/anthropics/claude-code/issues/867): $50のクレジットがあるのにエラー
- [Issue #627](https://github.com/anthropics/claude-code/issues/627): クレジットがあるのにエラー
- [Issue #1245](https://github.com/anthropics/claude-code/issues/1245): 組織にクレジットがあるのにエラー

## 4. レート制限との混同

フリープランのレート制限に達した場合でも、「Credit balance is too low」というエラーメッセージが表示されることがあります。

# 対処法

## 1. クレジット残高の確認

まず、[Anthropic Console](https://console.anthropic.com/)にログインして、実際のクレジット残高を確認します。

```bash
# APIキーが正しく設定されているか確認
echo $ANTHROPIC_API_KEY
```

## 2. クレジットの購入

残高が不足している場合は、最低$5からクレジットを購入できます：

1. Anthropic Consoleにログイン
2. "Plans & Billing"セクションへ移動
3. クレジットを購入（最低$5）

## 3. GitHub Secretsの設定確認

```yaml
# .github/workflows/claude-code.yml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

GitHub リポジトリの Settings > Secrets and variables > Actions で、`ANTHROPIC_API_KEY`が正しく設定されているか確認します。

## 4. 一時的な回避策

バグの場合の一時的な回避策：

```yaml
# リトライロジックの追加
- name: Run Claude Code with retry
  run: |
    for i in {1..3}; do
      if claude-code your-command; then
        break
      fi
      echo "Retry attempt $i..."
      sleep 10
    done
```

## 5. 代替手段の検討

エラーが続く場合は、以下の代替手段を検討：

- Claude APIの直接使用（Claude Code経由ではなく）
- 他のAI APIサービスの利用
- ローカル環境でClaude Codeを実行してからコミット

# デバッグ方法

## 1. 詳細なログの確認

```yaml
- name: Run Claude Code with debug
  env:
    DEBUG: true
  run: claude-code --verbose your-command
```

## 2. APIダッシュボードでの確認

Anthropic APIダッシュボードで以下を確認：
- リクエスト履歴
- エラーコード（499エラーなど）
- 使用量の推移

## 3. 組織アカウントの確認

組織でAPIを使用している場合：
- 組織のクレジット残高
- メンバーの権限設定
- 組織のAPIキーの有効性

# まとめ

「Credit balance is too low」エラーは、実際のクレジット不足以外にも様々な原因で発生する可能性があります。まずは基本的な確認事項をチェックし、それでも解決しない場合は既知のバグの可能性を疑い、GitHubのIssueを確認することをお勧めします。

このエラーに遭遇した場合は、[Claude Codeのリポジトリ](https://github.com/anthropics/claude-code/issues)でIssueを検索するか、新しくIssueを作成して報告することで、問題の早期解決に貢献できます。

# 参考リンク

- [Anthropic API Console](https://console.anthropic.com/)
- [Claude Code GitHub Repository](https://github.com/anthropics/claude-code)
- [Anthropic API Documentation](https://docs.anthropic.com/en/api)
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
