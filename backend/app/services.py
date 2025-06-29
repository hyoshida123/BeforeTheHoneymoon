import base64
import uuid
from typing import List
import logging

from google.cloud import storage
from app.models import ImageResult, SearchRequest
from app.config import settings

# ログ設定を詳細に
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PhotographerSearchService:
    """フォトグラファー検索サービス"""
    
    def __init__(self):
        """サービス初期化"""
        logger.info("PhotographerSearchService initialized")
        logger.info(f"CLOUD_STORAGE_BUCKET: {settings.CLOUD_STORAGE_BUCKET}")
        logger.info(f"DEBUG mode: {settings.DEBUG}")
    
    async def search_photographers(self, request: SearchRequest) -> List[ImageResult]:
        """フォトグラファーを検索する
        
        Args:
            request: 検索リクエスト
            
        Returns:
            List[ImageResult]: 最大9件の検索結果
        """
        logger.info(f"Starting search_photographers with request: destination={request.destination}, language={request.preferred_language}")
        logger.info(f"Reference image length: {len(request.reference_image)}")
        
        try:
            # 1. 参考画像をCloud Storageにアップロード
            logger.info("Step 1: Uploading reference image to Cloud Storage")
            uploaded_image_url = await self._upload_reference_image(request.reference_image)
            logger.info(f"Image uploaded successfully: {uploaded_image_url}")
            
            # 2. AI Agentを利用した画像分析と検索
            logger.info("Step 2: Creating search prompt")
            search_prompt = self._create_search_prompt(
                request.destination,
                request.preferred_language,
                uploaded_image_url
            )
            logger.info(f"Search prompt created: {search_prompt[:200]}...")
            
            # AI Agentに検索を依頼
            logger.info("Step 3: Calling AI agent")
            agent_response = await self._prompt_agent(search_prompt)
            logger.info(f"Agent response received: {agent_response[:200] if agent_response else 'None'}...")
            
            # 3. 結果をパースして返す
            logger.info("Step 4: Parsing agent response")
            results = self._parse_agent_response(agent_response, request.destination, request.preferred_language)
            logger.info(f"Parsed {len(results)} results")
            
            # 最大9件に制限
            final_results = results[:settings.MAX_RESULTS]
            logger.info(f"Returning {len(final_results)} final results")
            return final_results
            
        except Exception as e:
            logger.error(f"Error in search_photographers: {e}", exc_info=True)
            # エラー時は空のリストを返す
            return []
    
    async def _upload_reference_image(self, image_data: str) -> str:
        """参考画像をCloud Storageにアップロードする
        
        Args:
            image_data: Base64エンコードされた画像データ
            
        Returns:
            str: アップロード後の画像URL
        """
        logger.info("Starting image upload process")
        try:
            # Base64データから画像をデコード
            if ',' in image_data:
                image_data = image_data.split(',')[1]
                logger.info("Removed data URL prefix from image data")
            
            logger.info(f"Decoding base64 image data, length: {len(image_data)}")
            image_bytes = base64.b64decode(image_data)
            logger.info(f"Image decoded successfully, size: {len(image_bytes)} bytes")
            
            # ユニークなファイル名を生成
            file_name = f"reference_images/{uuid.uuid4()}.jpg"
            logger.info(f"Generated file name: {file_name}")
            
            # Cloud Storageクライアントを初期化
            logger.info("Initializing Cloud Storage client")
            client = storage.Client()
            bucket = client.bucket(settings.CLOUD_STORAGE_BUCKET)
            logger.info(f"Using bucket: {settings.CLOUD_STORAGE_BUCKET}")
            
            blob = bucket.blob(file_name)
            logger.info(f"Created blob: {file_name}")
            
            # 画像をアップロード
            logger.info("Uploading image to Cloud Storage")
            blob.upload_from_string(image_bytes, content_type='image/jpeg')
            logger.info("Image uploaded successfully")
            
            # 公開URLを返す
            result_url = f"gs://{settings.CLOUD_STORAGE_BUCKET}/{file_name}"
            logger.info(f"Returning image URL: {result_url}")
            return result_url
            
        except Exception as e:
            logger.error(f"Error uploading image: {e}", exc_info=True)
            raise Exception(f"Failed to upload image: {e}")
    
    async def _prompt_agent(self, prompt: str) -> str:
        """AI Agentにプロンプトを送信して結果を取得する
        
        Args:
            prompt: プロンプト
            
        Returns:
            str: 結果
        """
        logger.info("Starting agent prompt")
        logger.info(f"Prompt: {prompt[:200]}...")
        
        try:
            # エージェントラッパーを使用
            from app.agent.utils import run_agent
            
            logger.info("Calling run_agent function")
            response = await run_agent(prompt)
            logger.info(f"Agent response received: {response[:200] if response else 'None'}...")
            
            return response
            
        except Exception as e:
            logger.error(f"Error calling agent: {e}", exc_info=True)
            raise Exception(f"Failed to call agent: {e}")
    
    def _create_search_prompt(self, destination: str, language: str, image_url: str) -> str:
        """検索用のプロンプトを作成する"""
        logger.info(f"Creating search prompt for destination: {destination}, language: {language}")
        
        prompt = f"""
        Please help me find photographers in {destination} who can communicate in {language}.
        I have uploaded a reference image at {image_url} that shows the style I'm looking for.
        
        Please analyze the image style and find photographers who specialize in similar work.
        Return the results as Instagram URLs of photographers who:
        1. Are located in or frequently work in {destination}
        2. Can communicate in {language}
        3. Have a similar photography style to the reference image
        
        Format the response as a JSON array of objects with 'imageUrl' and 'instagramUrl' fields.
        """
        
        logger.info(f"Created prompt: {prompt[:200]}...")
        return prompt
    
    def _parse_agent_response(self, response: str, destination: str = "", language: str = "") -> List[ImageResult]:
        """エージェントのレスポンスをパースする"""
        logger.info("Starting to parse agent response")
        logger.info(f"Response type: {type(response)}")
        logger.info(f"Response length: {len(response) if response else 0}")
        logger.info(f"Response content: {repr(response)}")
        
        try:
            import json
            
            if not response or response.strip() == "":
                logger.warning("Agent response is empty")
                return []
            
            # JSONパースを試行
            logger.info("Attempting to parse JSON response")
            data = json.loads(response)
            logger.info(f"JSON parsed successfully: {type(data)}")
            logger.info(f"Parsed data: {data}")
            
            results = []
            # フロントエンド期待形式に対応
            images = data.get('images', data if isinstance(data, list) else [])
            logger.info(f"Found {len(images)} images in response")
            
            for i, item in enumerate(images):
                logger.info(f"Processing image {i+1}: {item}")
                if 'imageUrl' in item and 'instagramUrl' in item:
                    # Cloud StorageのInstagram URLファイルから実際のURLを取得
                    actual_instagram_url = self._get_instagram_url_from_storage(item['instagramUrl'])
                    logger.info(f"Instagram URL resolved: {actual_instagram_url}")
                    
                    results.append(ImageResult(
                        image_url=item['imageUrl'],
                        instagram_url=actual_instagram_url
                    ))
                    logger.info(f"Added result {i+1}: {item['imageUrl']}")
                else:
                    logger.warning(f"Image {i+1} missing required fields: {item}")
            
            logger.info(f"Successfully parsed {len(results)} results")
            
            # 詳細な結果をログに出力
            logger.info(f"=== PHOTOGRAPHER SEARCH RESULTS ===")
            logger.info(f"Search request: destination='{destination}', language='{language}'")
            logger.info(f"Total results found: {len(results)}")
            for i, result in enumerate(results):
                logger.info(f"Result {i+1}:")
                logger.info(f"  - Image URL: {result.image_url}")
                logger.info(f"  - Instagram URL: {result.instagram_url}")
            logger.info(f"=== END SEARCH RESULTS ===")
            
            return results
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.error(f"Response content: {repr(response)}")
            return []
        except Exception as e:
            logger.error(f"Error parsing agent response: {e}", exc_info=True)
            logger.error(f"Response content: {repr(response)}")
            return []
    
    def _get_instagram_url_from_storage(self, storage_path: str) -> str:
        """Cloud Storageからの実際のInstagram URLを取得"""
        logger.info(f"Getting Instagram URL from storage path: {storage_path}")
        
        try:
            if not storage_path.startswith('gs://'):
                logger.info(f"Not a storage path, returning as-is: {storage_path}")
                return storage_path  # 既に実際のURLの場合はそのまま返す
            
            # gs://bth-dev-storage/instagram_urls/photographer1.json -> instagram_urls/photographer1.json
            file_path = storage_path.replace(f'gs://{settings.CLOUD_STORAGE_BUCKET}/', '')
            logger.info(f"Extracted file path: {file_path}")
            
            client = storage.Client()
            bucket = client.bucket(settings.CLOUD_STORAGE_BUCKET)
            blob = bucket.blob(file_path)
            
            if blob.exists():
                logger.info(f"Storage file exists: {file_path}")
                import json
                data = json.loads(blob.download_as_text())
                instagram_url = data.get('instagram_url', storage_path)
                logger.info(f"Retrieved Instagram URL: {instagram_url}")
                return instagram_url
            else:
                logger.warning(f"Storage file does not exist: {file_path}")
                # ファイルが存在しない場合はパスからInstagram URLを生成
                username = file_path.split('/')[-1].replace('.json', '')
                instagram_url = f"https://instagram.com/{username}"
                logger.info(f"Generated Instagram URL: {instagram_url}")
                return instagram_url
                
        except Exception as e:
            logger.error(f"Error getting Instagram URL from storage: {e}", exc_info=True)
            # エラー時はパスからURLを推測
            if 'photographer' in storage_path:
                username = storage_path.split('/')[-1].replace('.json', '')
                instagram_url = f"https://instagram.com/{username}"
                logger.info(f"Fallback Instagram URL: {instagram_url}")
                return instagram_url
            fallback_url = "https://instagram.com/photographer"
            logger.info(f"Using default Instagram URL: {fallback_url}")
            return fallback_url
    
