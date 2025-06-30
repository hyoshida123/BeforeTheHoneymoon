import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.adk.cli.fast_api import get_fast_api_app

from app.config import settings
from app.models import SearchRequest, SearchResponse
from app.services import PhotographerSearchService

# ログ設定
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

logger.info("Initializing FastAPI app with ADK...")
app = get_fast_api_app(
    agents_dir=settings.AGENT_DIR,
    allow_origins=settings.ALLOWED_ORIGINS,
    web=True,
)
logger.info("FastAPI app initialized successfully")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# サービス初期化
logger.info("PhotographerSearchService functions ready...")


@app.get("/")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    logger.info("Health check endpoint called")
    return {"message": "Before the Honeymoon API is running"}


@app.get("/agent-info")
async def agent_info():
    """エージェント情報の提供"""
    logger.info("Agent info endpoint called")
    try:
        from app.agent.agent import root_agent

        # エージェントの利用可能なメソッドを取得
        methods = [method for method in dir(root_agent) if not method.startswith("_")]

        info = {
            "agent_name": root_agent.name,
            "description": root_agent.description,
            "model": root_agent.model,
            "tools": [t.__name__ for t in root_agent.tools],
            "available_methods": methods,
            "agent_type": type(root_agent).__name__,
        }
        logger.info(f"Agent info: {info}")
        return info
    except Exception as e:
        import traceback

        logger.error(f"Error getting agent info: {e}", exc_info=True)
        return {"error": str(e), "traceback": traceback.format_exc()}


@app.post("/test-agent")
async def test_agent():
    """エージェントのテスト用エンドポイント"""
    logger.info("Test agent endpoint called")
    try:
        from app.utils import run_agent

        # シンプルなテストプロンプト
        test_prompt = 'Hello, can you respond with a simple JSON like {"status": "ok", "message": "Agent is working"}?'
        logger.info(f"Test prompt: {test_prompt}")

        response = await run_agent(test_prompt, "Tokyo", "ja")
        logger.info(f"Test agent response type: {type(response)}")
        logger.info(f"Test agent response: {response}")

        return {"status": "success", "agent_response": response, "prompt": test_prompt}
    except Exception as e:
        import traceback

        logger.error(f"Error in test agent: {e}", exc_info=True)
        return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}


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
    logger.info("=== Search photographers endpoint called ===")
    logger.info(f"Request destination: {request.destination}")
    logger.info(f"Request language: {request.preferred_language}")
    logger.info(f"Request image length: {len(request.reference_image)}")

    try:
        # リクエストバリデーション
        logger.info("Validating request...")
        if request.preferred_language not in settings.SUPPORTED_LANGUAGES:
            logger.error(f"Invalid language: {request.preferred_language}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid language",
                    "message": f"Supported languages: {settings.SUPPORTED_LANGUAGES}",
                },
            )
        logger.info("Request validation passed")

        # 検索サービス呼び出し
        logger.info("Calling search service...")
        service = PhotographerSearchService()
        results = await service.search_photographers(request)
        logger.info(f"Search service returned {len(results)} results")

        response = SearchResponse(images=results)
        logger.info(f"Returning response with {len(response.images)} images")

        # レスポンス詳細をログに記録
        logger.info(f"=== FINAL API RESPONSE ===")
        logger.info(
            f"Request: destination='{request.destination}', language='{request.preferred_language}'"
        )
        logger.info(f"Response contains {len(response.images)} photographer results")
        logger.info(f"Full response data: {response.model_dump()}")
        logger.info(f"=== END API RESPONSE ===")

        return response

    except HTTPException:
        # HTTPExceptionはそのまま再送出
        logger.error("HTTPException occurred", exc_info=True)
        raise
    except Exception as e:
        # その他のエラーは500エラーとして処理
        import traceback

        logger.error(f"Search error: {e}", exc_info=True)
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal Server Error",
                "message": str(e),
                "traceback": traceback.format_exc(),
            },
        )


def main(request=None):
    import uvicorn

    if request:
        return app
    else:
        # ローカル開発用
        logger.info("Running in local development mode")
        logger.info("Starting uvicorn server on 0.0.0.0:8000")
        uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
