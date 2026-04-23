# 💰 CapitalSync

> An AI-powered personal finance tracker that lets you manage income, expenses, and goals — with smart invoice extraction using Gemini and GPT-4o.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)

---

## Overview

CapitalSync is a full-stack financial management application built for individuals and small businesses. Users can manually log income and expenses, upload invoices (PDF, image, DOCX) for AI-powered auto-extraction, set monthly financial goals, and view analytics — all behind Firebase authentication.

---

## Features

- 🔐 **Firebase Authentication** — Secure token-based auth on every protected route
- 💵 **Income & Expense Tracking** — Full CRUD with categories, payment methods, and notes
- 📄 **AI Invoice Extraction** — Upload PDF / image / DOCX; Gemini or GPT-4o parses it automatically
- 🤖 **AI Chat Widget** — Floating chat panel powered by Gemini or GPT-4o with conversation history
- 📊 **Analytics Dashboard** — 3-month income/expense breakdown, category summaries, goal progress
- 🎯 **Monthly Goals** — Set income and expense targets per category, track progress
- 🔄 **Paginated Transactions** — Filter by type, category, date, and amount with pagination
- 🐳 **Dockerized** — Full-stack Docker Compose setup with Nginx on the frontend

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Database | PostgreSQL + SQLAlchemy |
| Auth | Firebase Admin SDK |
| AI (Vision) | Google Gemini (`gemini-3-flash-preview`) |
| AI (Chat/Extract) | OpenAI GPT-4o / GPT-4o-mini |
| PDF Parsing | PyMuPDF (`fitz`) |
| DOCX Parsing | python-docx |
| Config | pydantic-settings |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Auth | Firebase JS SDK |
| Server | Nginx (Docker) |

---

## Project Structure

```
CapitalSync/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   └── firebase_auth.py       # Firebase token verification
│   │   ├── routes/
│   │   │   ├── income.py              # Income CRUD endpoints
│   │   │   ├── expense.py             # Expense CRUD endpoints
│   │   │   ├── transaction.py         # Paginated combined transactions
│   │   │   ├── categories.py          # User-specific category list
│   │   │   ├── analytics.py           # Analytics + goals endpoints
│   │   │   ├── extract.py             # Invoice upload & save
│   │   │   ├── chatGemini.py          # Gemini chat route
│   │   │   └── chatOpenAI.py          # OpenAI chat route
│   │   ├── services/
│   │   │   ├── google.py              # Gemini invoice extraction service
│   │   │   └── openai.py              # OpenAI invoice extraction service
│   │   ├── config.py                  # App settings (pydantic-settings)
│   │   ├── database.py                # SQLAlchemy engine + session
│   │   ├── models.py                  # Income, Expense, Goal DB models
│   │   ├── schemas.py                 # Pydantic request/response schemas
│   │   └── main.py                    # FastAPI app entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── .env
└── docker-compose.yml
```

---

## API Reference

### Authentication
All routes (except `/extract/save`) require a Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```

---

### Income — `/api/income`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/income/` | Create a new income record |
| `GET` | `/api/income/` | Get all income records for the user |
| `GET` | `/api/income/{id}` | Get a single income record |
| `PUT` | `/api/income/{id}` | Update an income record |
| `DELETE` | `/api/income/{id}` | Delete an income record |

**Income Categories:** `Salary/Wages`, `Freelance/Side hustle`, `Business Income`, `Investment`, `Others`

---

### Expense — `/api/expense`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/expense/` | Create a new expense record |
| `GET` | `/api/expense/` | Get all expense records for the user |
| `GET` | `/api/expense/{id}` | Get a single expense record |
| `PUT` | `/api/expense/{id}` | Update an expense record |
| `DELETE` | `/api/expense/{id}` | Delete an expense record |

**Expense Categories:** `Food & Drink`, `Housing`, `Transportation`, `Bills & Utilities`, `Health & Medical`  
**Payment Methods:** `Cash`, `Bank`

---

### Transactions — `/api/transactions`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions/` | Get paginated income + expense records |

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 50, max: 200) |
| `type` | string | `income` or `expense` |
| `category` | string | Filter by category |
| `date` | date | Filter by date (`YYYY-MM-DD`) |
| `price` | float | Filter by amount (±0.01 tolerance) |

---

### Analytics — `/api/analytics`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/income` | Last 3 months income records |
| `GET` | `/api/analytics/expenses` | Last 3 months expense records |
| `GET` | `/api/analytics/summary` | Total income, expenses, and net balance |
| `GET` | `/api/analytics/last-3-months` | Monthly breakdown for last 3 months |
| `GET` | `/api/analytics/categories` | Income and expense breakdown by category |
| `POST` | `/api/analytics/goals` | Create or update a monthly goal |
| `GET` | `/api/analytics/goals` | Get goals for last 3 months |
| `GET` | `/api/analytics/summary-with-goals` | Summary with goal progress percentages |
| `GET` | `/api/analytics/last-3-months-with-goals` | Monthly data with goal comparison |

---

### Categories — `/api/categories`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories/` | Get all unique categories used by the user |

---

### Invoice Extraction — `/extract`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/extract/invoice` | Upload a file and extract invoice data via AI |
| `POST` | `/extract/save` | Save extracted invoice to income/expense table |

**Supported file types:** `JPEG`, `PNG`, `WEBP`, `PDF`, `DOCX`

**Provider selection** (`?provider=gemini` or `?provider=openai`):
- `gemini` → Google Gemini `gemini-3-flash-preview` (default)
- `openai` → OpenAI `gpt-4o-mini`

---

### AI Chat — `/chat`

Both Gemini and OpenAI chat routes share the same endpoint path and form fields.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | Send a message and get an AI reply |

**Form fields:**

| Field | Required | Description |
|---|---|---|
| `text` | ✅ | User's current message |
| `system` | ✅ | System prompt (context for the AI) |
| `history` | ❌ | JSON array of past messages (last 6 used) |

---

## Database Models

### `incomes`
| Column | Type | Notes |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `user_id` | String | Firebase UID |
| `title` | String(255) | Optional |
| `amount` | Numeric(10,2) | Must be positive |
| `category` | String(100) | Income category |
| `date` | DateTime | Transaction date |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

### `expenses`
| Column | Type | Notes |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `user_id` | String | Firebase UID |
| `title` | String(255) | Optional |
| `amount` | Numeric(10,2) | Must be positive |
| `category` | String(100) | Expense category |
| `payment_method` | String(50) | `Cash` or `Bank` |
| `note` | Text | Optional |
| `date` | DateTime | Transaction date |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

### `goals`
| Column | Type | Notes |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `user_id` | String | Firebase UID |
| `goal_type` | String(50) | `income` or `expense` |
| `category` | String(100) | Optional, per-category goal |
| `target_amount` | Numeric(10,2) | Monthly target |
| `month` | String(7) | Format: `YYYY-MM` |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Docker & Docker Compose (for containerized setup)

### Backend (Local)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend (Local)

```bash
cd frontend

npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Environment Variables

### Backend — `backend/.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/capital_sync
FIREBASE_CREDENTIALS_PATH=./firebase_credentials.json
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

---

## Docker Setup

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes (wipes DB data)
docker compose down -v
```

**Services started by Docker Compose:**

| Service | Container Name | Host Port | Description |
|---|---|---|---|
| `api` | `fastapi_app` | `8000` | FastAPI backend server |
| `frontend` | `react_app` | `3000` | React app via Nginx |
| `db` | `postgres_db` | `5432` | PostgreSQL 15 database |

**Frontend Dockerfile** uses a multi-stage build:
1. **Stage 1 (builder)** — Node 20 Alpine, runs `npm install` + `npm run build`
2. **Stage 2** — Nginx Alpine, serves the built `/dist` folder with a custom `nginx.conf`

> **Note:** The backend connects to PostgreSQL using the service hostname `db` (Docker internal DNS). Your `DATABASE_URL` in `backend/.env` should use `db` as the host, not `localhost`:
> ```env
> DATABASE_URL=postgresql://postgres:admin@db:5432/capital_sync
> ```

**Persistent storage:** PostgreSQL data is stored in a named Docker volume `postgres_data` so data survives container restarts.

---

## License

This project is for personal and educational use.
