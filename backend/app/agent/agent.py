from google.adk.agents import Agent

from app.config import settings

def search_photographer_on_instagram(destination: str, language: str = "english", style_description: str = "") -> dict:
    """Search for photographers in a specific destination with language and style preferences.
    
    Args:
        destination: Target destination for photography
        language: Preferred communication language
        style_description: Description of desired photography style
    
    Returns:
        dict: Search results with photographer information
    """
    
    # AIエージェントに検索を依頼するプロンプトを作成
    search_prompt = f"""
    Find photographers in {destination} who can communicate in {language}.
    Style requirements: {style_description}
    
    Please provide a list of Instagram photographers who:
    1. Are based in or frequently work in {destination}
    2. Can communicate in {language}
    3. Match the photography style described
    
    Return exactly 3-6 photographer Instagram usernames (without @) that I can search for.
    Format as a simple list of usernames only.
    """
    
    # この関数は現在直接的な結果を返すため、
    # 実際のAI呼び出しは上位レイヤーで処理される
    return {
        "status": "search_needed",
        "prompt": search_prompt,
        "destination": destination,
        "language": language,
        "style_description": style_description
    }

def analyze_image_style(image_url: str) -> str:
    """Analyze uploaded image to determine photography style.
    
    Args:
        image_url: URL of the uploaded reference image
    
    Returns:
        str: Instructions for analyzing the image
    """
    
    return f"""Please analyze the photography style of the image at: {image_url}

Look at the following aspects:
1. Composition and framing
2. Lighting style (natural, studio, dramatic, etc.)
3. Color palette and mood
4. Subject matter and pose
5. Overall aesthetic and style

Based on your analysis, describe the photography style in a few descriptive words that would help match similar photographers."""

# Define the agent with the name "root_agent" (required by ADK)
root_agent = Agent(
    name="photographer_search_agent",
    model="gemini-2.5-flash", 
    description="AI agent that helps find photographers for destination photography based on style preferences, location, and language requirements.",
    instruction="""You are a helpful photography assistant that specializes in finding photographers for destination shoots.
    
    Your capabilities include:
    1. Analyzing reference images to understand desired photography style
    2. Finding photographers in specific destinations
    3. Matching photographers based on language preferences
    4. Providing Instagram profiles of recommended photographers
    
    When users provide a destination, language preference, and reference image:
    1. Use analyze_image_style to understand the desired photography style
    2. Use search_photographer_on_instagram to find matching photographers
    3. Return results in JSON format with imageUrl and instagramUrl fields
    
    Always respond with helpful, accurate information and provide Instagram URLs for photographer discovery.""",
    tools=[search_photographer_on_instagram, analyze_image_style],
)