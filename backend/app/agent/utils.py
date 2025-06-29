import inspect
import logging

# ログ設定
logger = logging.getLogger(__name__)

async def _fetch_and_store_instagram_image(username: str) -> str:
    """Instagram画像を取得してCloud Storageに保存"""
    import datetime
    import requests
    from google.cloud import storage
    from app.config import settings
    
    logger.info(f"Fetching Instagram image for {username}")
    
    try:
        # 現在の日付時刻（秒まで）でフォルダを作成
        date_now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"images/{date_now}/instagram_{username}.jpg"
        
        # Instagram公開プロフィール画像を取得（簡易版）
        # 実際の実装ではInstagram Graph APIまたはスクレイピングライブラリを使用
        # ここではプレースホルダー画像を使用
        placeholder_url = f"https://via.placeholder.com/400x400/0066cc/ffffff?text={username[:3].upper()}"
        
        response = requests.get(placeholder_url, timeout=10)
        response.raise_for_status()
        
        # Cloud Storageにアップロード
        client = storage.Client()
        bucket = client.bucket(settings.CLOUD_STORAGE_BUCKET)
        blob = bucket.blob(file_path)
        
        blob.upload_from_string(response.content, content_type='image/jpeg')
        
        # 公開URLを返す
        result_url = f"gs://{settings.CLOUD_STORAGE_BUCKET}/{file_path}"
        logger.info(f"Uploaded Instagram image: {result_url}")
        
        return result_url
        
    except Exception as e:
        logger.error(f"Error fetching Instagram image for {username}: {e}")
        # フォールバック: デフォルト画像
        return f"gs://{settings.CLOUD_STORAGE_BUCKET}/images/default/photographer_placeholder.jpg"

async def run_agent(prompt: str) -> str:
    logger.info("=== Starting run_agent ===")
    logger.info(f"Input prompt: {prompt[:200]}...")
    
    try:
        # 直接ツールを呼び出すアプローチから開始（最も安全）
        logger.info("Trying direct tool call first...")
        try:
            from app.agent.agent import search_photographer_on_instagram
            logger.info("Successfully imported search_photographer_on_instagram")
            
            # プロンプトから検索パラメータを抽出（簡易版）
            destination = "paris"  # デフォルト値
            language = "english"   # デフォルト値
            
            # プロンプトから実際のパラメータを抽出してみる
            prompt_lower = prompt.lower()
            if "ロンドン" in prompt or "london" in prompt_lower:
                destination = "london"
            elif "東京" in prompt or "tokyo" in prompt_lower:
                destination = "tokyo"
            elif "ニューヨーク" in prompt or "new york" in prompt_lower:
                destination = "new york"
            elif "パリ" in prompt or "paris" in prompt_lower:
                destination = "paris"
                
            if "japanese" in prompt_lower or "日本語" in prompt:
                language = "japanese"
            elif "english" in prompt_lower or "英語" in prompt:
                language = "english"
                
            logger.info(f"Extracted parameters: destination={destination}, language={language}")
            
            # ツールを直接呼び出し
            logger.info("Calling search_photographer_on_instagram directly...")
            tool_result = search_photographer_on_instagram(destination, language, prompt)
            logger.info(f"Direct tool result: {tool_result}")
            
            # ツール結果がプロンプト生成の場合、AIエージェントを呼び出す
            if isinstance(tool_result, dict) and tool_result.get('status') == 'search_needed':
                logger.info("Tool returned search prompt, calling AI agent...")
                
                # AIエージェントを使って実際の検索を実行
                from app.agent.agent import root_agent
                
                ai_prompt = tool_result['prompt']
                logger.info(f"AI search prompt: {ai_prompt}")
                
                try:
                    # AIエージェントから写真家のユーザー名リストを取得
                    ai_response = await root_agent.run_async(ai_prompt)
                    photographer_usernames = []
                    
                    # レスポンスを処理
                    if hasattr(ai_response, '__aiter__'):
                        async for chunk in ai_response:
                            if hasattr(chunk, 'content'):
                                content = chunk.content
                                # ユーザー名を抽出（改行区切りまたはカンマ区切り）
                                lines = content.replace(',', '\n').split('\n')
                                for line in lines:
                                    username = line.strip().replace('@', '')
                                    if username and len(username) > 2:
                                        photographer_usernames.append(username)
                    
                    logger.info(f"Found photographer usernames: {photographer_usernames}")
                    
                    # 各写真家のInstagram画像を取得してCloud Storageに保存
                    results = []
                    for username in photographer_usernames[:6]:  # 最大6件
                        try:
                            image_url = await _fetch_and_store_instagram_image(username)
                            results.append({
                                "imageUrl": image_url,
                                "instagramUrl": f"https://instagram.com/{username}"
                            })
                        except Exception as e:
                            logger.warning(f"Failed to fetch image for {username}: {e}")
                    
                    import json
                    result_json = json.dumps({"images": results})
                    
                    logger.info(f"=== AI AGENT RESPONSE ===")
                    logger.info(f"AI found {len(photographer_usernames)} photographers")
                    logger.info(f"Successfully processed {len(results)} photographers with images")
                    logger.info(f"Final JSON response: {result_json}")
                    logger.info(f"=== END AI RESPONSE ===")
                    
                    return result_json
                    
                except Exception as e:
                    logger.error(f"Error calling AI agent: {e}", exc_info=True)
                    # フォールバック: 空の結果を返す
                    import json
                    return json.dumps({"images": []})
            
            else:
                logger.warning("Tool result is not in expected format, returning empty result")
                logger.warning(f"Unexpected tool result: {tool_result}")
                import json
                return json.dumps({
                    "images": []
                })
                
        except Exception as e_direct:
            logger.error(f"Direct tool call failed: {e_direct}", exc_info=True)
            
            # 従来のエージェント呼び出しは当面スキップ
            logger.warning("Skipping agent calls due to context issues, returning empty result")
            import json
            return json.dumps({
                "images": []
            })
                
    except Exception as e:
        logger.error(f"Error in run_agent: {e}", exc_info=True)
        import json
        return json.dumps({"images": []})