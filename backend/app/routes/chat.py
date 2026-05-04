"""
app/routes/chat.py

POST /api/chat/

Body:
  {
    "message":          "Add an expense of LKR 3500 for electricity",
    "provider":         "gemini" | "openai",
    "history":          [ {"role": "user", "content": "..."}, ... ],
    "current_hour":     14,
    "is_first_message": true
  }

Response:
  {
    "reply":   "Good morning! ☀️ Done! I've saved your electricity bill...",
    "history": [ ... updated history ... ]
  }
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Literal

from app.database import get_db
from app.auth.firebase_auth import verify_firebase_token
from app.services.chat_gemini import chat as gemini_chat, build_system_prompt
from app.services.chat_openai import chat as openai_chat

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ─────────────────────────────────────────────
#  Schemas
# ─────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role:    str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message:          str
    provider:         Literal["gemini", "openai"] = "gemini"
    history:          list[HistoryMessage] = Field(default_factory=list)
    current_hour:     int  = Field(default=12)
    is_first_message: bool = Field(default=False)


class ChatResponse(BaseModel):
    reply:   str
    history: list[HistoryMessage]


# ─────────────────────────────────────────────
#  Route
# ─────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    body:    ChatRequest,
    user_id: str     = Depends(verify_firebase_token),
    db:      Session = Depends(get_db),
):
    # Time-aware + friendly system prompt
    system_prompt = build_system_prompt(
        hour             = body.current_hour,
        is_first_message = body.is_first_message,
    )

    if body.provider == "gemini":
        gemini_history = [
            {
                "role":  "model" if m.role == "assistant" else m.role,
                "parts": [{"text": m.content}],
            }
            for m in body.history
        ]
        reply = await gemini_chat(
            history      = gemini_history,
            user_message = body.message,
            user_id      = user_id,
            db           = db,
            system       = system_prompt,
        )

    elif body.provider == "openai":
        openai_history = [
            {
                "role":    "assistant" if m.role == "model" else m.role,
                "content": m.content,
            }
            for m in body.history
        ]
        reply = await openai_chat(
            history      = openai_history,
            user_message = body.message,
            user_id      = user_id,
            db           = db,
            system       = system_prompt,
        )

    else:
        raise HTTPException(status_code=400, detail="Unknown provider")

    updated_history = list(body.history) + [
        HistoryMessage(role="user",      content=body.message),
        HistoryMessage(role="assistant", content=reply),
    ]

    return ChatResponse(reply=reply, history=updated_history)