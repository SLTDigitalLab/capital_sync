import os
import json
from fastapi import APIRouter, Form
from google import genai
from google.genai import types
from dotenv import load_dotenv
from app.config import settings

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chat"])

client = genai.Client(api_key=settings.gemini_api_key)


@router.post("")
async def chat(
    text: str = Form(...),
    system: str = Form(...),
    history: str = Form("[]"),
):
    history_data = json.loads(history)

    # Last 6 messages only — cost control
    recent = history_data[-6:]

    # Build contents list
    contents = []
    for msg in recent:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part(text=msg["content"])]
            )
        )

    # Add current user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part(text=text)]
        )
    )

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        config=types.GenerateContentConfig(
            system_instruction=system,
        ),
        contents=contents,
    )

    return {"reply": response.text}