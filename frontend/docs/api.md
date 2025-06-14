# Before the Honeymoon - API Documentation

## 概要

海外でのフォトグラファー検索アプリのAPIドキュメントです。ユーザーの希望条件に基づいて、最適なフォトグラファーの写真とInstagramアカウントを返却します。

## API エンドポイント

### フォトグラファー検索

**URL:** `https://your-cloud-function-url.cloudfunctions.net/searchPhotographers`
**Method:** `POST`
**Content-Type:** `application/json`

## Request（入力データ）

### パラメータ

| フィールド名        | 型     | 必須 | 説明                   | 例                                        |
| ------------------- | ------ | ---- | ---------------------- | ----------------------------------------- |
| `destination`       | string | ✓    | 撮影希望の目的地       | `"パリ"`, `"モントリオール"`, `"グアム"`          |
| `preferredLanguage` | string | ✓    | ユーザーの希望する言語 | `"japanese"`, `"english"`, `"korean"`     |
| `referenceImage`    | string | ✓    | 参考にしたい写真のURL  | `"https://images.unsplash.com/photo-..."` |

### 使用可能な言語オプション

| 値             | 表示名    |
| -------------- | --------- |
| `"japanese"`   | 日本語    |
| `"english"`    | English   |
| `"korean"`     | 한국어    |
| `"chinese"`    | 中文      |
| `"french"`     | Français  |
| `"spanish"`    | Español   |
| `"german"`     | Deutsch   |
| `"italian"`    | Italiano  |
| `"portuguese"` | Português |

### Request例

```json
{
    "destination": "パリ",
    "preferredLanguage": "japanese",
    "referenceImage": "https://images.unsplash.com/photo-1519741497674-611481863552"
}
```

## Response（返却データ）

### 成功時（HTTP 200）

| フィールド名 | 型    | 必須 | 説明                                            |
| ------------ | ----- | ---- | ----------------------------------------------- |
| `images`     | array | ✓    | フォトグラファーの写真とリンクの配列（最大9件） |

### `images` 配列の各要素

| フィールド名   | 型     | 必須 | 説明                                     | 例                                                                                    |
| -------------- | ------ | ---- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `imageUrl`     | string | ✓    | フォトグラファーの作品画像URL            | `"https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop"` |
| `instagramUrl` | string | ✓    | フォトグラファーのInstagramアカウントURL | `"https://instagram.com/paris_wedding_photos"`                                        |

### Response例

```json
{
    "images": [
        {
            "imageUrl": "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/paris_wedding_photos"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/romantic_moments_paris"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/eiffel_captures"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/paris_love_stories"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/french_wedding_photo"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/parisian_photographer"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/seine_wedding_shots"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/montmartre_memories"
        },
        {
            "imageUrl": "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop",
            "instagramUrl": "https://instagram.com/louvre_love_photos"
        }
    ]
}
```

### エラー時（HTTP 4xx/5xx）

一般的なHTTPエラーステータスコードを返却します。

| ステータス | 説明                                                 |
| ---------- | ---------------------------------------------------- |
| 400        | Bad Request - 必須パラメータが不足、または形式が不正 |
| 500        | Internal Server Error - サーバー内部エラー           |

### エラーResponse例

```json
{
    "error": "Missing required parameter: destination",
    "message": "destination field is required"
}
```

## 画像仕様

### 要求される画像形式

- **サイズ**: 400x400ピクセル推奨
- **形式**: JPEG, PNG
- **縦横比**: 1:1（正方形）
- **最適化**: Web表示用に最適化済み

### Instagram URL仕様

- **形式**: `https://instagram.com/[username]`
- **要件**: 実在するアクティブなアカウント
- **言語対応**: ユーザーの希望言語でコミュニケーション可能

## フロントエンド側の処理

### リクエスト処理

```javascript
const requestData = {
    destination: destination,
    preferredLanguage: preferredLanguage,
    referenceImage: uploadedImage,
};

const response = await fetch(CLOUD_FUNCTION_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
});
```

### レスポンス処理

```javascript
const result = await response.json();

if (result && result.images && Array.isArray(result.images)) {
    // 最大9件の画像を3x3グリッドで表示
    setSearchResults(result.images);
} else {
    throw new Error("Invalid response format");
}
```

### エラーハンドリング

```javascript
try {
    // API呼び出し
} catch (error) {
    console.error("Search error:", error);
    // フォールバック処理（モックデータ表示）
    setSearchResults(MOCK_RESPONSE.images);
}
```

## 技術仕様

### フロントエンド

- **フレームワーク**: React Native (Expo)
- **対応プラットフォーム**: iOS, Android, Web
- **状態管理**: React Hooks (useState)
- **UIコンポーネント**: React Native標準コンポーネント

### バックエンド要件

- **推奨環境**: Google Cloud Functions, AWS Lambda
- **ランタイム**: Node.js, Python, Go等
- **レスポンス時間**: 5秒以内推奨
- **レート制限**: 適宜実装

## セキュリティ

### 推奨事項

- **HTTPS必須**: すべての通信はHTTPS
- **CORS設定**: 適切なCORSヘッダー設定
- **レート制限**: DDoS攻撃対策
- **入力検証**: SQLインジェクション等の対策

### 画像URL

- **外部画像**: 信頼できるドメインからの画像のみ
- **検証**: 画像URLの有効性確認
- **プロキシ**: 必要に応じて画像プロキシサーバー経由

## モックモード

開発・テスト用にモックモードを提供しています。

### 有効化方法

```javascript
// App.js の設定
const useMock = true; // または環境変数 USE_MOCK_ONLY=true
```

### モックデータ

実際のAPIレスポンス形式と同じ構造のテストデータを返却します。

## デプロイメント

### CloudFlare Pages

```bash
# ビルドコマンド
cd frontend && pnpm install && pnpm run build

# 出力ディレクトリ
frontend/dist
```

### 環境変数

| 変数名          | 説明               | 例                        |
| --------------- | ------------------ | ------------------------- |
| `USE_MOCK_ONLY` | モックモード有効化 | `"true"` または `"false"` |

## サポート

### 問題報告

GitHubリポジトリのIssuesまでご報告ください。

### 動作環境

- **iOS**: 13.0以上
- **Android**: API Level 21以上
- **Web**: モダンブラウザ（Chrome, Firefox, Safari, Edge）

## 更新履歴

| バージョン | 日付       | 更新内容     |
| ---------- | ---------- | ------------ |
| v1.0.0     | 2024-12-XX | 初回リリース |
