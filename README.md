# BeforeTheHoneymoon

## 概要

BeforeTheHoney はハネムーン中の夫婦にぴったりなフォトグラファーを探すサービスです。

## ディレクトリ構成

- backend: FastAPI と Google ADK
- frontend: Expo Go
- infra: Pulumi
- images: 画像リソース

## 全体アーキテクチャ

```mermaid
flowchart LR
    subgraph Client
        A[Expo Go App]
    end
    
    subgraph Cloud
        B[Cloud Run]
        C[Generative AI API]
        D[Cloud Storage]
    end
    
    A -->|Request| B
    B -->|Request to AI API| C
    C -->|Result| B
    B -->|Save to Storage| D
    D -->|Get from Storage| B
    B -->|Response| A
```

## イメージ図

<div style="text-align: center;">
  <img src="./images/home_ios.jpg" alt="iOS Home Screen" width="300">
</div>

<div style="text-align: center;">
  <img src="./images/result_ios.jpg" alt="iOS Result Screen" width="300">
</div>
