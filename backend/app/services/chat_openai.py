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


# ─────────────────────────────────────────────
#  Convert tool schema → OpenAI format
# ─────────────────────────────────────────────

def _to_openai_tools() -> list:
    return [
        {
            "type": "function",
            "function": {
                "name":        t["name"],
                "description": t["description"],
                "parameters":  t["input_schema"],
            },
        }
        for t in TOOLS
    ]


# ─────────────────────────────────────────────
#  Main chat function
# ─────────────────────────────────────────────

async def chat(
    history:      list[dict],
    user_message: str,
    user_id:      str,
    db:           Session,
    system:       str = "",
) -> str:
    """
    history : [{"role": "user"|"assistant", "content": "..."}]
    system  : build_system_prompt() එකෙන් chat.py pass කරනවා
    """
    # system prompt — chat.py pass fallback
    from app.services.chat_gemini import build_system_prompt
    system_prompt = system if system else build_system_prompt(hour=12, is_first_message=False)

    messages = (
        [{"role": "system", "content": system_prompt}]
        + history
        + [{"role": "user", "content": user_message}]
    )

    openai_tools = _to_openai_tools()

    # Agentic loop — tool calls 
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

        # Tool call නෑ → text reply
        if not msg.tool_calls:
            return msg.content or "I'm not sure how to help with that 😊"

        # Assistant tool-call message history add
        messages.append({
            "role":       "assistant",
            "content":    msg.content,
            "tool_calls": [
                {
                    "id":       tc.id,
                    "type":     "function",
                    "function": {
                        "name":      tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in msg.tool_calls
            ],
        })

        # Tool calls execute results add
        for tc in msg.tool_calls:
            tool_input  = json.loads(tc.function.arguments)
            tool_result = execute_tool(tc.function.name, tool_input, user_id, db)
            messages.append({
                "role":         "tool",
                "tool_call_id": tc.id,
                "content":      tool_result,
            })