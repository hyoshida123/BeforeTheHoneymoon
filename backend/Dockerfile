# Cloud Run用Dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

ENV GOOGLE_GENAI_USE_VERTEXAI="True"
ENV GOOGLE_CLOUD_PROJECT="eternal-photon-292207"
ENV GOOGLE_CLOUD_LOCATION="us-central1"
ENV GOOGLE_GENAI_MODEL="gemini-2.5-flash"

# ポート8080を公開（Cloud Runのデフォルト）
EXPOSE 8080

# uvicornでアプリケーションを起動（Cloud RunのPORT環境変数を使用）
CMD uvicorn app.app:app --host 0.0.0.0 --port ${PORT:-8080}