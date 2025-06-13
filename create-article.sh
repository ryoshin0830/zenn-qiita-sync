#!/bin/bash

echo "📝 新しい記事を作成します"
echo

read -p "タイトル: " title
read -p "絵文字 (デフォルト: 📝): " emoji
emoji=${emoji:-📝}
read -p "タグ (カンマ区切り): " topics

npm run new -- --title "$title" --emoji "$emoji" --topics "$topics"