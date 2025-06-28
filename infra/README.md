# Google Cloud を利用したインフラ

```sh
# インストールしていない場合
brew install pulumi/tap/pulumi
brew install --cask google-cloud-sdk

# 認証
GCP_PROJECT_ID=your_project_id
gcloud config set project ${GCP_PROJECT_ID}
gcloud auth login
gcloud auth application-default login

pulumi config set gcp:project ${GCP_PROJECT_ID}
pnpm i

# 差分確認
pulumi preview --color always
pulumi stack ls

# デプロイ
pulumi up --color always --yes
```
