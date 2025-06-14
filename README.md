# BeforeTheHoneymoon

## 概要

BeforeTheHoney は、フォトグラファーのためのポートフォリオサイトです。

## ディレクトリ構成

- frontend: Expo Go
- infra Pulumi
- backend: TODO: 作成予定

## 全体アーキテクチャ

```mermaid
flowchart LR
    subgraph Client
        A[Expo Go App]
    end
    
    subgraph Cloud
        B[Cloud Function]
        C[Generative AI API]
        D[Cloud Storage]
    end
    
    A -->|Invoke Cloud Function| B
    B -->|Request to AI API| C
    C -->|Result| B
    B -->|Save to Storage| D
    D -->|Get from Storage| B
    B -->|Response| A
```

## イメージ図

![iOS Home Screen](./images/home_ios.jpg)
