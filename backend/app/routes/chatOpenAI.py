import os
import json
from fastapi import APIRouter, Form
from openai import OpenAI
from dotenv import load_dotenv
from app.config import settings

load_dotenv()
router = APIRouter(prefix="/chat", tags=["Chat"])
client = OpenAI(api_key=settings.openai_api_key)

@router.post("")
async def chat(
    text: str = Form(...),
    system: str = Form(...),
    history: str = Form("[]"),
):
    history_data = json.loads(history)

    # Last 6 messages only — cost control
    recent = history_data[-6:]

    # Build messages list
    messages = []
    for msg in recent:
        role = "user" if msg["role"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["content"]})

    # Add current user message
    messages.append({"role": "user", "content": text})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system},
            *messages
        ],
    )

    return {"reply": response.choices[0].message.content}