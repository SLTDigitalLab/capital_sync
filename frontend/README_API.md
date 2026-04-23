Development API connection and test steps

- Start the backend (from project root):

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Start the frontend (from project root):

```bash
cd frontend
npm install    # if dependencies not installed
npm run dev
```

- Environment:
  - `frontend/.env` contains `VITE_API_URL=http://localhost:8000` — frontend reads it via `import.meta.env.VITE_API_URL`.
  - Vite dev server also proxies `/api/*` → `http://localhost:8000/*`.

- Quick tests:

```bash
# direct backend
curl http://localhost:8000/

# via vite proxy (when frontend dev server running)
curl http://localhost:5173/api/
```

- Notes on auth:
  - If you use Firebase ID tokens, send `Authorization: Bearer <idToken>` from the frontend.
  - Verify tokens on the backend with Firebase Admin SDK.
