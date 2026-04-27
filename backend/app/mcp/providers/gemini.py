"""
app/mcp/providers/gemini.py

Gemini chat provider with MCP tool calling.
Drop-in replacement for app/services/chat_gemini.py
Signature matches what chat.py route expects:

    chat(history, user_message, user_id, db) -> str
"""

import os
from datetime import date as date_cls
from typing import Any

import google.generativeai as genai

from app.mcp.server import mcp

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
    history : Gemini-format  [{"role": "user"/"model", "parts": [{"text":"..."}]}]
    Returns  : plain text reply string
    """
    tools = await _build_gemini_tools()

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        tools=tools,
        system_instruction=_SYSTEM.format(
            today=date_cls.today().isoformat(),
            user_id=user_id,
        ),
    )

    session  = model.start_chat(history=history)
    response = session.send_message(user_message)

    # Agentic loop — keep calling tools until the model gives a text reply
    for _ in range(10):  # safety cap
        part = response.candidates[0].content.parts[0]

        if not part.function_call.name:
            break  # plain text reply — done

        fn_name = part.function_call.name
        fn_args = dict(part.function_call.args)
        fn_args["user_id"] = user_id  # always inject from auth

        tool_result = await _run_tool(fn_name, fn_args)

        response = session.send_message(
            genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name=fn_name,
                    response={"result": tool_result},
                )
            )
        )

    return response.text


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _build_gemini_tools():
    """Convert MCP tool list → Gemini FunctionDeclaration list."""
    declarations = []
    for tool in await mcp.list_tools():
        declarations.append(
            genai.protos.FunctionDeclaration(
                name=tool.name,
                description=tool.description,
                parameters=_json_schema_to_gemini(tool.parameters),
            )
        )
    return [genai.protos.Tool(function_declarations=declarations)]


def _json_schema_to_gemini(schema: dict) -> genai.protos.Schema:
    """Recursively convert a JSON Schema object → Gemini Schema proto."""
    TYPE_MAP = {
        "string":  "STRING",
        "number":  "NUMBER",
        "integer": "INTEGER",
        "boolean": "BOOLEAN",
        "array":   "ARRAY",
        "object":  "OBJECT",
    }

    props = {}
    for prop_name, prop_def in schema.get("properties", {}).items():
        props[prop_name] = genai.protos.Schema(
            type=TYPE_MAP.get(prop_def.get("type", "string"), "STRING"),
            description=prop_def.get("description", ""),
        )

    return genai.protos.Schema(
        type="OBJECT",
        properties=props,
        required=schema.get("required", []),
    )


async def _run_tool(name: str, args: dict) -> str:
    """Look up and execute an MCP tool by name."""
    # fastmcp exposes tools as a dict or list depending on version
    tools = await mcp.list_tools()
    tools_map: dict[str, Any] = {t.name: t for t in tools}
    tool = tools_map.get(name)
    if tool is None:
        return f"Unknown tool: {name}"
    try:
        return tool.fn(**args)
    except Exception as e:
        return f"Tool error: {str(e)}"