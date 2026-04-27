"""
app/mcp/providers/openai.py

OpenAI chat provider with MCP tool calling.
Drop-in replacement for app/services/chat_openai.py
Signature matches what chat.py route expects:

    chat(history, user_message, user_id, db) -> str
"""

import os
import json
from datetime import date as date_cls
from typing import Any

from openai import OpenAI

from app.mcp.server import mcp

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ── System prompt ──────────────────────────────────────────────────────────────
_SYSTEM = """
You are a friendly personal finance assistant for a Sri Lankan finance tracker app.
You help users manage their income and expense records.

Rules:
- Always confirm the action you took (add / delete).
- Show the amount in LKR with commas (e.g. LKR 3,500.00).
- When adding, pick the closest valid category from the list below.
- When deleting, if the user hasn't given an ID, first call list_expenses or
  list_incomes so you can find the right record, then delete it.
- Never guess an ID — always look it up first.
- Today's date: {today}
- User ID (use this in every tool call): {user_id}

Expense categories : Food & Drink, Housing, Transportation, Bills & Utilities,
                     Health & Medical, Others
Income  categories : Salary/Wages, Freelance/Side hustle, Business Income,
                     Investment, Others
Payment methods    : Cash, Bank
""".strip()


# ── Public interface ───────────────────────────────────────────────────────────

async def chat(history: list, user_message: str, user_id: str, db) -> str:
    """
    history : OpenAI-format  [{"role": "user"/"assistant", "content": "..."}]
    Returns  : plain text reply string
    """
    messages = [
        {
            "role": "system",
            "content": _SYSTEM.format(
                today=date_cls.today().isoformat(),
                user_id=user_id,
            ),
        },
        *history,
        {"role": "user", "content": user_message},
    ]

    tools = await _build_openai_tools()

    # Agentic loop — keep calling tools until the model gives a text reply
    for _ in range(10):  # safety cap
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
        )
        msg = response.choices[0].message

        # No tool call — plain text reply
        if not msg.tool_calls:
            return msg.content

        # Append assistant message with tool calls
        messages.append(msg)

        # Execute each tool call and append results
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            args["user_id"] = user_id  # always inject from auth

            result = await _run_tool(tc.function.name, args)

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                }
            )

    return "Sorry, I couldn't complete that action. Please try again."


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _build_openai_tools() -> list:
    """Convert MCP tool list → OpenAI function tool list."""
    tools = []
    for tool in await mcp.list_tools():
        # Remove user_id from parameters — we inject it from auth
        schema = dict(tool.parameters)
        props  = {k: v for k, v in schema.get("properties", {}).items() if k != "user_id"}
        req    = [r for r in schema.get("required", []) if r != "user_id"]

        tools.append(
            {
                "type": "function",
                "function": {
                    "name":        tool.name,
                    "description": tool.description,
                    "parameters": {
                        "type":       "object",
                        "properties": props,
                        "required":   req,
                    },
                },
            }
        )
    return tools


async def _run_tool(name: str, args: dict) -> str:
    """Look up and execute an MCP tool by name."""
    tools = await mcp.list_tools()
    tools_map: dict[str, Any] = {t.name: t for t in tools}
    tool = tools_map.get(name)
    if tool is None:
        return f"Unknown tool: {name}"
    try:
        return tool.fn(**args)
    except Exception as e:
        return f"Tool error: {str(e)}"