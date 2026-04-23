from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import income, expense, transaction, categories
from app.routes.chatGemini import router as chat_router_gemini
from app.routes.chatOpenAI import router as chat_router_openai
from app.routes.extract import router as extract_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WealthTrack API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(income.router)
app.include_router(expense.router)
app.include_router(transaction.router)
app.include_router(categories.router)
app.include_router(chat_router_openai)
app.include_router(chat_router_gemini)
app.include_router(extract_router)

@app.get("/")
def read_root():
    return {"message": "WealthTrack API is running"}