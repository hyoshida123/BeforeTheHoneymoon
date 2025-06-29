"""
AIエージェント用プロンプトテンプレート
"""

def get_photographer_search_prompt(destination: str, language: str, style_description: str = "") -> str:
    """写真家検索用プロンプトを生成する
    
    Args:
        destination: 撮影地
        language: 対応言語
        style_description: スタイル説明
        
    Returns:
        str: AIエージェント用プロンプト
    """
    
    base_prompt = f"""
    Find photographers in {destination} who can communicate in {language}.
    Style requirements: {style_description}
    
    Please provide a list of Instagram photographers who:
    1. Are based in or frequently work in {destination}
    2. Can communicate in {language}
    3. Match the photography style described
    
    Return exactly 3-6 photographer Instagram usernames (without @) that I can search for.
    Format as a simple list of usernames only, one per line.
    
    Example format:
    photographer1
    photographer2
    photographer3
    """
    
    return base_prompt.strip()


def get_image_analysis_prompt(image_url: str) -> str:
    """画像分析用プロンプトを生成する
    
    Args:
        image_url: 分析対象の画像URL
        
    Returns:
        str: 画像分析用プロンプト
    """
    
    prompt = f"""
    Please analyze the photography style of the image at: {image_url}

    Look at the following aspects:
    1. Composition and framing
    2. Lighting style (natural, studio, dramatic, etc.)
    3. Color palette and mood
    4. Subject matter and pose
    5. Overall aesthetic and style

    Based on your analysis, describe the photography style in a few descriptive words that would help match similar photographers.
    """
    
    return prompt.strip()


def get_service_search_prompt(destination: str, language: str, image_url: str) -> str:
    """サービス層で使用する検索プロンプトを生成する
    
    Args:
        destination: 撮影地
        language: 対応言語
        image_url: 参考画像URL
        
    Returns:
        str: 検索用プロンプト
    """
    
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
    
    return prompt.strip()