# Google Cloud を利用したインフラ

```sh
# インストールしていない場合
brew install pulumi/tap/pulumi
brew install --cask google-cloud-sdk

# 認証
GCP_PROJECT_ID=your_project_id
gcloud config set project ${GCP_PROJECT_ID}
gcloud auth application-default login

pulumi config set gcp:project ${GCP_PROJECT_ID}
pnpm i

# 差分確認
pulumi preview --color always
pulumi stack ls

# 初回は FIRST=true をつける
FIRST=true pulumi up --color always --yes
```

## 注意

- 初回はコンテナイメージがないため、`FIRST=true` を指定してデプロイする必要がある
- 2回目以降は `FIRST=true` を指定しないでデプロイする
- `pulumi up` でエラーになった場合は、`pulumi destroy` でリソースを削除してから再度デプロイする
