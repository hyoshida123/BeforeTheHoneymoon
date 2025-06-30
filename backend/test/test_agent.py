import pytest

from app.agent import root_agent


class TestAgent:
    def test_agent_info(self):
        assert root_agent.name == "photographer_search_agent"
        assert (
            root_agent.description
            == "Agent that provides photographer search information for specific destination on Instagram."
        )
        assert root_agent.model == "gemini-2.5-flash"
        assert root_agent.tools == [search_photographer_on_instagram]
