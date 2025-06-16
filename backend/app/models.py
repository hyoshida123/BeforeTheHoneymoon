from typing import List

from pydantic import BaseModel, HttpUrl, ConfigDict, Field


class SearchRequest(BaseModel):
    """フォトグラファー検索リクエストモデル"""
    
    model_config = ConfigDict(populate_by_name=True)
    destination: str = Field(alias="destination")
    preferred_language: str = Field(alias="preferredLanguage")
    reference_image: str = Field(alias="referenceImage")


class ImageResult(BaseModel):
    """検索結果の画像情報"""
    
    model_config = ConfigDict(populate_by_name=True)
    status_code: int
    image_url: HttpUrl = Field(alias="imageUrl")
    instagram_url: HttpUrl = Field(alias="instagramUrl")


class SearchResponse(BaseModel):
    """フォトグラファー検索レスポンスモデル"""
    
    status_code: int
    images: List[ImageResult]