import os
from typing import List


class Settings:
    """アプリケーション設定"""
    
    # API設定
    API_TITLE: str = "Before the Honeymoon API"
    API_DESCRIPTION: str = "海外でのフォトグラファー検索API"
    API_VERSION: str = "0.1.0"

    # エージェント設定
    AGENT_DIR: str = os.path.join(os.path.dirname(__file__), "agent")
    
    # CORS設定
    ALLOWED_ORIGINS: List[str] = ["*"]  # 本番環境では適切に制限する
    
    # Cloud Storage設定
    CLOUD_STORAGE_BUCKET: str = os.getenv("CLOUD_STORAGE_BUCKET", "")
    
    # 検索結果設定
    MAX_RESULTS: int = 9
    
    # サポート言語
    SUPPORTED_LANGUAGES: List[str] = [
        "japanese",
        "english"
    ]
    
    # 画像設定
    IMAGE_SIZE: str = "400x400"
    IMAGE_FORMAT: str = "crop"
    
    # 開発・デバッグ設定
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    

settings = Settings() 