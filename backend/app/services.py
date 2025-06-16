from typing import List

from app.models import ImageResult, SearchRequest


class PhotographerSearchService:
    """フォトグラファー検索サービス"""
    
    def __init__(self):
        """サービス初期化"""
        pass
    
    async def search_photographers(self, request: SearchRequest) -> List[ImageResult]:
        """フォトグラファーを検索する
        
        Args:
            request: 検索リクエスト
            
        Returns:
            List[ImageResult]: 最大9件の検索結果
        """
        # TODO: 実装予定の機能:
        # 1. 参考画像をCloud Storageにアップロード
        # 2. AI Agentを利用して以下の機能を実装
        # 2.1. 画像分析（スタイル、構図等）
        # 2.2. 目的地に基づくフォトグラファー検索
        # 2.3. 言語条件でのフィルタリング
        # 2.4. 結果の最適化とランキング
        
        # 現在は空のリストを返す
        return []
    
    def _upload_reference_image(self, image_url: str) -> str:
        """参考画像をCloud Storageにアップロードする
        
        Args:
            image_url: アップロード対象の画像URL
            
        Returns:
            str: アップロード後の画像URL
        """
        # TODO: 参考画像のアップロードロジック実装
        pass
    
    def _prompt_agent(self, prompt: str) -> str:
        """AI Agentにプロンプトを送信して結果を取得する
        
        Args:
            prompt: プロンプト
            
        Returns:
            str: 結果
        """
        # TODO: AI Agentにプロンプトを送信して結果を取得するロジック実装
        pass