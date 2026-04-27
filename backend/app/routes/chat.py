"""
app/routes/chat.py

POST /api/chat

Body:
  {
    "message": "Add an expense of LKR 3500 for electricity",
    "provider": "gemini" | "openai",
    "history": [
      {"role": "user",      "content": "..."},
      {"role": "assistant", "content": "..."}
    ]
  }

Response:
  {
    "reply": "Done! I've saved your electricity bill ...",
    "history": [ ... updated history including this turn ... ]
  }

The frontend keeps `history` in state and sends it back each turn.
No server-side session storage needed.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Literal

from app.database import get_db
from app.auth.firebase_auth import verify_firebase_token

# ── MCP-powered providers (replaces old services/chat_gemini & chat_openai) ──
import app.mcp.providers.gemini as gemini_chat
import app.mcp.providers.openai as openai_chat

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ─────────────────────────────────────────────
#  Request / Response schemas
# ─────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str        # "user" or "assistant" / "model"
    content: str


class ChatRequest(BaseModel):
    message:  str
    provider: Literal["gemini", "openai"] = "gemini"
    history:  list[HistoryMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply:   str
    history: list[HistoryMessage]


# ─────────────────────────────────────────────
#  Route
# ─────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    body: ChatRequest,
    user_id: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Single endpoint for both Gemini and OpenAI chat.
    Both providers now use FastMCP tools to add/remove/list
    incomes and expenses directly in the database.
    """
    if body.provider == "gemini":
        # Gemini uses "model" role instead of "assistant"
        gemini_history = [
            {
                "role":  "model" if m.role == "assistant" else m.role,
                "parts": [{"text": m.content}],
            }
            for m in body.history
        ]
        reply = await gemini_chat.chat(
            history=gemini_history,
            user_message=body.message,
            user_id=user_id,
            db=db,
        )

    elif body.provider == "openai":
        openai_history = [
            {
                "role":    "assistant" if m.role == "model" else m.role,
                "content": m.content,
            }
            for m in body.history
        ]
        reply = await openai_chat.chat(
            history=openai_history,
            user_message=body.message,
            user_id=user_id,
            db=db,
        )

    else:
        raise HTTPException(status_code=400, detail="Unknown provider")

    # Append this turn to history and return to frontend
    updated_history = list(body.history) + [
        HistoryMessage(role="user",      content=body.message),
        HistoryMessage(role="assistant", content=reply),
    ]

    return ChatResponse(reply=reply, history=updated_history)