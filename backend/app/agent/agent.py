from google.adk.agents import Agent

from app.config import settings

def search_photographer_on_instagram(destination: str) -> dict:
    """Search for photographers in a specific destination."""

    if destination.lower() in settings.SUPPORTED_DESTINATIONS:
        pass

    return {
        "status": "error",
        "error_message": f"Photographer search information for '{destination}' unavailable."
    }

# Define the agent with the name "root_agent" (required by ADK)
root_agent = Agent(
    name="photographer_search_agent",
    model="gemini-2.5-flash", 
    description="Agent that provides photographer search information for specific destination.",
    instruction="You help users with photographer search information for specific destination on Instagram.",
    tools=[search_photographer_on_instagram],
)