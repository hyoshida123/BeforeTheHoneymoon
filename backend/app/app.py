from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.adk.cli.fast_api import get_fast_api_app

from app.config import settings
from app.models import SearchRequest, SearchResponse
from app.services import PhotographerSearchService

# app = FastAPI(
#     title=settings.API_TITLE,
#     description=settings.API_DESCRIPTION,
#     version=settings.API_VERSION
# )

app = get_fast_api_app(
    agents_dir=settings.AGENT_DIR,
    allow_origins=settings.ALLOWED_ORIGINS,
    web=True,
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# サービス初期化
search_service = PhotographerSearchService()


@app.get("/")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"message": "Before the Honeymoon API is running"}

@app.get("/agent-info")
async def agent_info():
    """エージェント情報の提供"""
    from agent import root_agent

    return {
        "agent_name": root_agent.name,
        "description": root_agent.description,
        "model": root_agent.model,
        "tools": [t.__name__ for t in root_agent.tools]
    }

@app.post("/searchPhotographers", response_model=SearchResponse)
async def search_photographers(request: SearchRequest):
    """フォトグラファー検索エンドポイント
    
    Args:
        request: 検索条件を含むリクエストデータ
        
    Returns:
        SearchResponse: 最大9件のフォトグラファー画像と Instagram URL
        
    Raises:
        HTTPException: 400 - 不正なリクエストパラメータ
        HTTPException: 500 - サーバー内部エラー
    """
    try:
        # リクエストバリデーション
        if request.preferredLanguage not in settings.SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400,
                detail={"error": "Invalid language", "message": f"Supported languages: {settings.SUPPORTED_LANGUAGES}"}
            )
        
        # 検索サービス呼び出し
        results = await search_service.search_photographers(request)
        
        return SearchResponse(images=results)
        
    except HTTPException:
        # HTTPExceptionはそのまま再送出
        raise
    except Exception as e:
        # その他のエラーは500エラーとして処理
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal Server Error", "message": str(e)}
        )


# Cloud Functions用のエントリーポイント
def main(request=None):
    """Cloud Functions用のメイン関数"""
    import uvicorn
    
    if request:
        # Cloud Functionsで実行される場合
        return app
    else:
        # ローカル開発用
        uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
