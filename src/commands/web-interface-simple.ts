import express from 'express';
import { SyncService } from '../lib/sync-service.js';
import chalk from 'chalk';
import open from 'open';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenn-Qiita Sync - 新規記事作成</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 600px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 28px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            color: #555;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        input[type="text"],
        select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        input[type="text"]:focus,
        select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .emoji-picker {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        
        .emoji-option {
            font-size: 24px;
            padding: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .emoji-option:hover {
            background: #f5f5f5;
            transform: scale(1.1);
        }
        
        .emoji-option.selected {
            border-color: #667eea;
            background: #f0f4ff;
        }
        
        .tag-input-container {
            position: relative;
        }
        
        .tag-suggestions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        
        .tag-suggestion {
            background: #f0f4ff;
            color: #667eea;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .tag-suggestion:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }
        
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 30px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .success-message {
            background: #4caf50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-top: 20px;
            display: none;
        }
        
        .error-message {
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-top: 20px;
            display: none;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 新規記事作成</h1>
        <form id="articleForm">
            <div class="form-group">
                <label for="title">記事タイトル *</label>
                <input type="text" id="title" name="title" required placeholder="例: React Hooksの使い方完全ガイド">
            </div>
            
            <div class="form-group">
                <label for="emoji">アイコン絵文字</label>
                <input type="text" id="emoji" name="emoji" value="📝" maxlength="2">
                <div class="emoji-picker">
                    <span class="emoji-option" data-emoji="📝">📝</span>
                    <span class="emoji-option" data-emoji="🚀">🚀</span>
                    <span class="emoji-option" data-emoji="💡">💡</span>
                    <span class="emoji-option" data-emoji="🔥">🔥</span>
                    <span class="emoji-option" data-emoji="⚡">⚡</span>
                    <span class="emoji-option" data-emoji="🎯">🎯</span>
                    <span class="emoji-option" data-emoji="🛠️">🛠️</span>
                    <span class="emoji-option" data-emoji="🎨">🎨</span>
                    <span class="emoji-option" data-emoji="🔧">🔧</span>
                    <span class="emoji-option" data-emoji="📱">📱</span>
                    <span class="emoji-option" data-emoji="💻">💻</span>
                    <span class="emoji-option" data-emoji="🌟">🌟</span>
                </div>
            </div>
            
            <div class="form-group">
                <label for="type">記事タイプ</label>
                <select id="type" name="type">
                    <option value="tech">技術記事 (tech)</option>
                    <option value="idea">アイデア記事 (idea)</option>
                </select>
            </div>
            
            <div class="form-group tag-input-container">
                <label for="topics">タグ (カンマ区切り、最大5個)</label>
                <input type="text" id="topics" name="topics" placeholder="例: JavaScript, React, TypeScript">
                <div class="tag-suggestions">
                    <span class="tag-suggestion">JavaScript</span>
                    <span class="tag-suggestion">TypeScript</span>
                    <span class="tag-suggestion">React</span>
                    <span class="tag-suggestion">Vue.js</span>
                    <span class="tag-suggestion">Node.js</span>
                    <span class="tag-suggestion">Python</span>
                    <span class="tag-suggestion">Git</span>
                    <span class="tag-suggestion">Docker</span>
                </div>
            </div>
            
            <button type="submit">記事を作成</button>
        </form>
        
        <div class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px;">記事を作成中...</p>
        </div>
        
        <div class="success-message" id="successMessage"></div>
        <div class="error-message" id="errorMessage"></div>
    </div>
    
    <script>
        // Emoji picker
        document.querySelectorAll('.emoji-option').forEach(option => {
            option.addEventListener('click', function() {
                const emoji = this.getAttribute('data-emoji');
                document.getElementById('emoji').value = emoji;
                
                document.querySelectorAll('.emoji-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
        
        // Tag suggestions
        document.querySelectorAll('.tag-suggestion').forEach(tag => {
            tag.addEventListener('click', function() {
                const topicsInput = document.getElementById('topics');
                const currentTags = topicsInput.value.split(',').map(t => t.trim()).filter(t => t);
                const newTag = this.textContent;
                
                if (!currentTags.includes(newTag) && currentTags.length < 5) {
                    currentTags.push(newTag);
                    topicsInput.value = currentTags.join(', ');
                }
            });
        });
        
        // Form submission
        document.getElementById('articleForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Show loading
            this.style.display = 'none';
            document.querySelector('.loading').style.display = 'block';
            
            try {
                const response = await fetch('/api/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                document.querySelector('.loading').style.display = 'none';
                
                if (response.ok) {
                    const successMsg = document.getElementById('successMessage');
                    successMsg.innerHTML = \`
                        <h2>✅ 記事が作成されました！</h2>
                        <p style="margin-top: 10px;">記事ファイル: articles/\${result.slug}.md</p>
                        <p style="margin-top: 10px;">
                            次のステップ:<br>
                            1. 記事を編集してください<br>
                            2. <code>npm run post \${result.slug}</code> で投稿
                        </p>
                    \`;
                    successMsg.style.display = 'block';
                    
                    // 3秒後にウィンドウを閉じる
                    setTimeout(() => {
                        window.close();
                    }, 5000);
                } else {
                    throw new Error(result.error || '記事の作成に失敗しました');
                }
            } catch (error) {
                document.querySelector('.loading').style.display = 'none';
                const errorMsg = document.getElementById('errorMessage');
                errorMsg.textContent = 'エラー: ' + error.message;
                errorMsg.style.display = 'block';
                this.style.display = 'block';
            }
        });
    </script>
</body>
</html>
`;

export async function startWebInterface(): Promise<void> {
  return new Promise((resolve) => {
    app.get('/', (req, res) => {
      res.send(HTML_TEMPLATE);
    });

    app.post('/api/create', async (req, res) => {
      try {
        const { title, emoji, type, topics } = req.body;
        
        const topicsArray = topics
          ? topics.split(',').map((t: string) => t.trim()).filter((t: string) => t)
          : [];

        const result = await SyncService.createNewArticle({
          title,
          emoji: emoji || '📝',
          type: type as 'tech' | 'idea',
          topics: topicsArray
        });

        res.json({ success: true, slug: result });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const url = `http://localhost:${port}`;
      
      console.log(chalk.blue(`\n🌐 Webインターフェースを起動しました: ${url}`));
      console.log(chalk.gray('ブラウザが自動的に開きます...\n'));
      
      // ブラウザを自動的に開く
      open(url);
      
      // 記事作成後、サーバーを停止
      setTimeout(() => {
        server.close(() => {
          resolve();
        });
      }, 60000); // 1分後に自動終了
    });
  });
}