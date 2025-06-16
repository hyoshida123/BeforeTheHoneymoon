# FastAPIを利用したバックエンド

続きの実装は以下を参照

https://google.github.io/adk-docs/deploy/cloud-run/
https://zenn.dev/satohjohn/articles/b23bd65c289257


infra: Cloud Run
storage: Cloud Storage
python package manager: uv
linter: ruff

## 開発・実行方法

### ローカル開発
```bash
# 依存関係のインストール
uv sync

# 開発サーバー起動
uvicorn app:app --reload
# または
uv run python app/app.py

# Format
uv run ruff format --check
```

### エントリーポイント
- メインアプリケーション: `app.py`
- FastAPIアプリケーションオブジェクト: `app`