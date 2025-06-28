# Cloud Run用Dockerfile
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# Pythonの出力をバッファリングしない
ENV PYTHONUNBUFFERED=1

# システムパッケージの更新と必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルをコピー
COPY requirements.txt .

# Python依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY app/ ./app/

# ポート8080を公開（Cloud Runのデフォルト）
EXPOSE 8080

# uvicornでアプリケーションを起動（Cloud RunのPORT環境変数を使用）
CMD uvicorn app.app:app --host 0.0.0.0 --port ${PORT:-8080}