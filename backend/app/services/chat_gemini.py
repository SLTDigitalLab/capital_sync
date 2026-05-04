"""
app/services/chat_gemini.py

Gemini-powered AI chat with MCP tool calling.
The model can call create_expense / create_income / get_expenses / get_income
to read and write the PostgreSQL database on behalf of the user.
"""

from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from app.config import settings
from app.services.mcp_tools import TOOLS, execute_tool

client = genai.Client(api_key=settings.gemini_api_key)


# ─────────────────────────────────────────────
#  System prompt builder
# ─────────────────────────────────────────────

def build_system_prompt(hour: int, is_first_message: bool) -> str:

    if 5 <= hour < 12:
        greeting = "Good morning! ☀️"
    elif 12 <= hour < 17:
        greeting = "Good afternoon! 🌤️"
    elif 17 <= hour < 21:
        greeting = "Good evening! 🌙"
    else:
        greeting = "Hey, still up? 🌟"

    greeting_instruction = ""
    if is_first_message:
        greeting_instruction = f"""
GREETING (first message only):
Start your reply with exactly: "{greeting}"
Then continue naturally.
"""

    return f"""You are WealthTrack AI — a friendly personal finance assistant for a Sri Lankan user.
Your job is to help the user track income and expenses using the tools provided.

{greeting_instruction}

PERSONALITY:
- Be warm, casual, and friendly — like a helpful friend.
- Keep replies short and clear.
- Occasional emojis are fine 😊
- NEVER say "thank you", "thanks for asking", or any formal closing phrases.

TOOLS YOU CAN USE:
- create_expense  → user wants to log an expense
- create_income   → user wants to log income
- get_expenses    → user asks about spending or expenses
- get_income      → user asks about earnings or income

STRICT RULES:
1. You ONLY help with personal finance topics.
2. If the user asks about ANYTHING outside finance (YouTube, movies, cooking, news, etc.)
   → respond warmly but redirect:
   "I'm only here to help with your finances 😊 Want to add an expense or check your balance?"
3. For finance questions that need data → ALWAYS call a tool first.
4. If no tool result is relevant → say:
   "I don't see any records for that yet. Want to add some data first?"
5. NEVER give general financial advice unrelated to the user's saved records.
"""


# ─────────────────────────────────────────────
#  Convert tool schema → Gemini format
# ─────────────────────────────────────────────

def _to_gemini_tools() -> list:
    declarations = []
    for t in TOOLS:
        props = {}
        for name, spec in t["input_schema"]["properties"].items():
            props[name] = {
                "type":        spec["type"].upper(),
                "description": spec.get("description", ""),
            }
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
    history : [{"role": "user"|"model", "parts": [{"text": "..."}]}]
    system  : build_system_prompt() එකෙන් chat.py pass කරනවා
    """
    system_prompt = system if system else build_system_prompt(hour=12, is_first_message=False)
    messages      = history + [{"role": "user", "parts": [{"text": user_message}]}]
    gemini_tools  = _to_gemini_tools()

    # Agentic loop — tool calls 
    while True:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                tools=gemini_tools,
            ),
            contents=messages,
        )

        candidate = response.candidates[0]
        part      = candidate.content.parts[0]

        # Tool call → text reply
        if not hasattr(part, "function_call") or part.function_call is None:
            return part.text or "I'm not sure how to help with that 😊"

        # Tool call → execute result feed back
        fn          = part.function_call
        tool_result = execute_tool(fn.name, dict(fn.args), user_id, db)

        messages.append({
            "role":  "model",
            "parts": [{"function_call": {"name": fn.name, "args": dict(fn.args)}}],
        })
        messages.append({
            "role":  "user",
            "parts": [{
                "function_response": {
                    "name":     fn.name,
                    "response": {"result": tool_result},
                }
            }],
        })