# Before the Honeymoon Backend API

Google ADKを使用したフォトグラファー検索バックエンドAPI

## 使用技術

- **Framework**: FastAPI + Google ADK (Agent Development Kit)
- **AI Model**: Gemini 2.5 Flash
- **Infrastructure**: Cloud Run
- **Storage**: Cloud Storage
- **Package Manager**: uv
- **Linter**: ruff

## 機能

- Instagram写真家の検索
- AI による画像スタイル分析
- 多言語対応（日本語・英語）
- Cloud Storage への画像アップロード

## 開発・実行方法

### 1. 依存関係のインストール

```bash
uv sync
```

### 2. 環境変数の設定

```bash
export CLOUD_STORAGE_BUCKET=bth-dev-storage
export DEBUG=true
```

### 3. ローカルサーバーの起動

```bash
# 基本的な起動
CLOUD_STORAGE_BUCKET=bth-dev-storage DEBUG=true uv run uvicorn app.app:app --reload --host 127.0.0.1 --port 8000

# またはバックグラウンドで起動
CLOUD_STORAGE_BUCKET=bth-dev-storage DEBUG=true uv run uvicorn app.app:app --reload --host 127.0.0.1 --port 8000 &
```

### 4. 動作確認

```bash
# ヘルスチェック
curl -X GET http://127.0.0.1:8000/

# エージェント情報
curl -X GET http://127.0.0.1:8000/agent-info

# エージェントテスト
curl -X POST http://127.0.0.1:8000/test-agent
```

### 5. コードフォーマット

```bash
uv run ruff format --check
```

## API エンドポイント

### エントリーポイント

- メインアプリケーション: `app/app.py`
- FastAPIアプリケーションオブジェクト: `app`

### POST /searchPhotographers

フォトグラファー検索のメインエンドポイント

#### リクエスト例

```bash
curl -X POST http://127.0.0.1:8000/searchPhotographers \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "paris",
    "preferredLanguage": "english", 
    "referenceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  }'
```

#### レスポンス例

```json
{
  "images": [
    {
      "imageUrl": "gs://bth-dev-storage/images/20250629_143052/instagram_photographer1.jpg",
      "instagramUrl": "https://instagram.com/paris_wedding_photographer"
    },
    {
      "imageUrl": "gs://bth-dev-storage/images/20250629_143052/instagram_photographer2.jpg", 
      "instagramUrl": "https://instagram.com/romantic_moments_paris"
    }
  ]
}
```

## 対応言語

- `japanese`: 日本語
- `english`: 英語

## 技術詳細

### AI エージェント

- **モデル**: Gemini 2.5 Flash
- **機能**: 画像スタイル分析、写真家検索
- **ツール**: Instagram写真家検索、画像スタイル分析

### Cloud Storage

- **バケット**: `bth-dev-storage`
- **画像保存先**: `images/YYYYMMDD_HHMMSS/`
- **形式**: `instagram_{username}.jpg`

### ログ出力

詳細なログがGoogle Cloud Logging に出力されます：

- AI エージェントのレスポンス
- 写真家検索結果
- API リクエスト/レスポンス詳細


AIzaSyDUZIILYHcfPy1A-zuqg_hI5xLNdM77_LI