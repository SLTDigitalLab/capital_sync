"""
app/services/chat_openai.py

OpenAI-powered AI chat with MCP tool calling.
The model can call create_expense / create_income / get_expenses / get_income
to read and write the PostgreSQL database on behalf of the user.
"""

import json
from openai import OpenAI
from sqlalchemy.orm import Session
from app.config import settings
from app.services.mcp_tools import TOOLS, execute_tool

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are a helpful personal finance assistant for a Sri Lankan business.

You have tools to CREATE and READ expenses and income records in the user's database.

Guidelines:
- When the user wants to add/log/record money spent → call create_expense
- When the user wants to add/log/record money earned → call create_income
- When the user asks about their spending, finances, or history → call get_expenses and/or get_income
- Always confirm what you saved or found in a friendly, concise reply
- Use LKR as the default currency
- If the user gives you an amount without a category, make a sensible inference and mention it
- Never make up data — only report what the tools return
"""

# Convert our tool schema format to OpenAI's format
def _to_openai_tools() -> list:
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["input_schema"],
            },
        }
        for t in TOOLS
    ]


def chat(history: list[dict], user_message: str, user_id: str, db: Session) -> str:
    """
    history : list of {"role": "user"|"assistant", "content": "..."}
    Returns the assistant's final text reply.
    """
    messages = (
        [{"role": "system", "content": SYSTEM_PROMPT}]
        + history
        + [{"role": "user", "content": user_message}]
    )

    openai_tools = _to_openai_tools()

    # Agentic loop — keep going until no more tool calls
    while True:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=openai_tools,
            tool_choice="auto",
            temperature=0.3,
            max_tokens=1000,
        )

        msg = response.choices[0].message

        # No tool call → return the text answer
        if not msg.tool_calls:
            return msg.content

        # Add the assistant's tool-call message to history
        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in msg.tool_calls
            ],
        })

        # Execute each tool call and append results
        for tc in msg.tool_calls:
            tool_input = json.loads(tc.function.arguments)
            tool_result = execute_tool(tc.function.name, tool_input, user_id, db)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": tool_result,
            })