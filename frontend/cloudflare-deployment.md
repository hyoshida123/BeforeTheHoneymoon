# CloudFlare Pages デプロイメント手順

## 1. プロジェクトの準備

アプリはWeb版として正常にビルドできるようになりました。`dist`フォルダに出力されます。

### ビルドコマンド

```bash
pnpm run build
```

## 2. CloudFlare Pages でのデプロイ

### GitHubから自動デプロイする場合

1. **CloudFlare Dashboard**にログイン
2. **Pages** > **Create a project** を選択
3. **Connect to Git** でGitHubリポジトリを選択
4. **Build settings**で以下を設定：
   - **Framework preset**: `Custom`
   - **Build command**: `cd frontend && pnpm install && pnpm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory (advanced)**: `/`（空欄でも可）

### 手動アップロードする場合

1. **CloudFlare Dashboard**にログイン
2. **Pages** > **Upload assets** を選択
3. `dist`フォルダの中身をアップロード

## 3. 環境変数（必要に応じて）

現在のアプリでは特別な環境変数は不要ですが、将来的にAPIキーなどが必要になった場合：

1. CloudFlare Pages の**Settings** > **Environment variables**
2. 必要な環境変数を追加

## 4. カスタムドメイン（オプション）

1. **Custom domains**タブでドメインを追加
2. DNSレコードを設定

## 注意事項

- Expo Web は SPA（Single Page Application）として動作
- すべてのルートが`index.html`にリダイレクトされる必要がある
- CloudFlare Pages は自動的にSPAとして認識してくれます

## 確認

デプロイ後、以下が正常に動作することを確認：

- 行き先入力フォーム
- 国籍入力フォーム
- 画像アップロード（デモ）
- フォトグラファー検索結果表示
- Instagramリンク
