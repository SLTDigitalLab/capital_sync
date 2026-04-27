import sys
import os
import asyncio

# Change CWD to backend so .env loads correctly
os.chdir('..\\backend')
sys.path.append(os.getcwd())

from app.mcp.providers.gemini import chat

async def main():
    try:
        # Mocking a DB and simple history
        db = None
        user_id = "test_user_id"
        history = []
        user_message = "Hi"
        
        reply = await chat(history, user_message, user_id, db)
        print("Reply:", reply)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
