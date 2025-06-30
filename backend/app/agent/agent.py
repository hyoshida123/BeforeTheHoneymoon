from google.adk.agents import Agent
from google.adk.sessions import VertexAiSessionService
from google.adk.runners import Runner
from google.genai import types

import vertexai
from vertexai import agent_engines

import uuid
from pydantic import Field

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
    
    from app.prompts import get_photographer_search_prompt
    
    # プロンプトファイルから検索プロンプトを取得
    search_prompt = get_photographer_search_prompt(destination, language, style_description)
    
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
    
    from app.prompts import get_image_analysis_prompt
    
    return get_image_analysis_prompt(image_url)

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

# Vertex AI Agent Engine
agent_engine = agent_engines.create()
app_name = agent_engine.name.split("/")[-1]

# Session and Runner
session_service = VertexAiSessionService(
    "eternal-photon-292207",
    "us-central1"
)
runner = Runner(
    agent=root_agent,
    app_name=app_name,
    session_service=session_service
)

# Agent Interaction
def call_agent(query):
  user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
  session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
  content = types.Content(role='user', parts=[types.Part(text=query)])
  events = runner.run(
      user_id=user_id, session_id=session_id, new_message=content)

  for event in events:
      if event.is_final_response():
          final_response = event.content.parts[0].text
          print("Agent Response: ", final_response)
