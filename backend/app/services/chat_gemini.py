"""
app/services/chat_gemini.py

Gemini-powered AI chat with MCP tool calling.
The model can call create_expense / create_income / get_expenses / get_income
to read and write the PostgreSQL database on behalf of the user.
"""

import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from app.config import settings
from app.services.mcp_tools import TOOLS, execute_tool

client = genai.Client(api_key=settings.gemini_api_key)

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

# Convert our tool schema format to Gemini's format
def _to_gemini_tools() -> list:
    declarations = []
    for t in TOOLS:
        props = {}
        for name, spec in t["input_schema"]["properties"].items():
            prop = {"type": spec["type"].upper(), "description": spec.get("description", "")}
            props[name] = prop

        declarations.append(
            types.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=types.Schema(
                    type="OBJECT",
                    properties={k: types.Schema(**v) for k, v in props.items()},
                    required=t["input_schema"].get("required", []),
                ),
            )
        )
    return [types.Tool(function_declarations=declarations)]


def chat(history: list[dict], user_message: str, user_id: str, db: Session) -> str:
    """
    history : list of {"role": "user"|"model", "parts": [{"text": "..."}]}
    Returns the assistant's final text reply.
    """
    # Append the new user message
    messages = history + [{"role": "user", "parts": [{"text": user_message}]}]

    gemini_tools = _to_gemini_tools()

    # Agentic loop — keep going until no more tool calls
    while True:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=gemini_tools,
            ),
            contents=messages,
        )

        candidate = response.candidates[0]
        part = candidate.content.parts[0]

        # No tool call → return the text answer
        if not hasattr(part, "function_call") or part.function_call is None:
            return part.text

        # Tool call → execute and feed result back
        fn = part.function_call
        tool_result = execute_tool(fn.name, dict(fn.args), user_id, db)

        # Add model's tool-call turn
        messages.append({
            "role": "model",
            "parts": [{"function_call": {"name": fn.name, "args": dict(fn.args)}}],
        })
        # Add tool result turn
        messages.append({
            "role": "user",
            "parts": [{
                "function_response": {
                    "name": fn.name,
                    "response": {"result": tool_result},
                }
            }],
        })