# Google Cloud を利用したインフラ

```sh
brew install pulumi/tap/pulumi
brew install --cask google-cloud-sdk

GCP_PROJECT_ID=your_project_id
gcloud config set project ${GCP_PROJECT_ID}
gcloud auth application-default login

pulumi config set gcp:project ${GCP_PROJECT_ID}
pnpm i

# 差分確認
FIRST=true pulumi preview
pulumi preview

# デプロイ
FIRST=true pulumi up
pulumi up
```

## 注意

- 初回はコンテナイメージがないため、`FIRST=true` を指定してデプロイする必要がある
- 2回目以降は `FIRST=true` を指定しないでデプロイする
- `pulumi up` でエラーになった場合は、`pulumi destroy` でリソースを削除してから再度デプロイする
