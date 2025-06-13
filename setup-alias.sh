#!/bin/bash

echo "# Zenn-Qiita Sync aliases"
echo "以下のエイリアスを ~/.zshrc または ~/.bashrc に追加してください："
echo ""
echo "alias zq='cd $(pwd) && npm run web'"
echo "alias zqnew='cd $(pwd) && npm run web'"
echo "alias zqpost='cd $(pwd) && npm run post'"
echo "alias zqsync='cd $(pwd) && npm run sync'"
echo ""
echo "設定後、以下のコマンドを実行してください："
echo "source ~/.zshrc  # または source ~/.bashrc"
echo ""
echo "その後、どこからでも 'zq' と入力するだけで記事作成画面が開きます！"