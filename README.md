# Equilibrium

An anonymous, AI-assisted mental health peer-support platform: React/TypeScript frontend, Node/Express
backend, MongoDB, and a Python FastAPI microservice for emotion & risk analysis.

## Important — read before using this beyond a demo

- **The AI is a rule-based classifier, not a clinical tool.** It detects keywords/patterns tied to
  common emotions and distress language. It does not diagnose anything and should never be
  presented to real users as clinically validated. See `ai-service/analyzer.py` for exactly how it
  works — it's intentionally transparent so you can audit it.
- **Crisis detection is a safety net, not a guarantee.** It will miss things and it will
  false-positive on things. Every high/critical-risk path in the code shows real hotline
  information and notifies a human mentor — keep that behavior if you extend it.
- Google Login, voice notes, wearable integration, and multilingual support are stubbed as
  TODOs — they need real provider credentials / device SDKs this repo doesn't include.
- If you deploy this for real users, get a mental health professional and a lawyer to review the
  crisis-response flow and your Terms/Privacy Policy before launch.

## Project structure

```
equilibrium/
  backend/      Node.js + Express + MongoDB (Mongoose) + JWT auth + Socket.IO chat
  ai-service/   Python + FastAPI emotion/risk analysis microservice
  frontend/     React + TypeScript + Vite + Tailwind CSS
```

## Running locally

### 1. Database
Install MongoDB Community Edition locally, or create a free cluster at MongoDB Atlas and copy its
connection string.

### 2. AI service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Backend
```bash
cd backend
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET at minimum
npm install
npm run seed              # creates an admin + mentor account + starter resources
npm run dev                # http://localhost:5000
```
Default seeded accounts (change the password immediately in a real deployment):
- `admin@equilibrium.app` / `ChangeMe123!`
- `mentor@equilibrium.app` / `ChangeMe123!`

### 4. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Register a new account from the UI to try the full user flow, or log in as the seeded mentor/admin.

## Deploying (per the original spec)

- **Frontend → Vercel**: import the `frontend/` folder as the project root, set `VITE_API_URL` /
  `VITE_SOCKET_URL` to your deployed backend URL.
- **Backend → Render**: deploy `backend/` as a Web Service, set all `.env` variables in Render's
  dashboard (never commit `.env`). Point `AI_SERVICE_URL` at wherever you deploy `ai-service/`
  (Render, Railway, Fly.io all work fine for a small FastAPI service).
- **Database → MongoDB Atlas**: create a free cluster, whitelist your backend's IP (or `0.0.0.0/0`
  for simplicity while testing), and use that connection string as `MONGO_URI`.

## What's implemented vs. stubbed

**Implemented and working:** email/password auth (JWT + bcrypt), anonymous posting with categories
and tags, likes/comments, AI emotion + risk analysis wired into post creation, crisis alert →
mentor notification pipeline, mood tracker with history charts, private journal with search, mentor
dashboard (assigned users, alerts), real-time mentor chat (Socket.IO), admin dashboard (platform
stats, emotion distribution, report moderation), resource library, rate limiting, helmet/CORS,
profanity filtering, role-based route protection.

**Stubbed / TODO (see inline comments):** Google OAuth (`authController.js`), email sending for
verification & password reset (uses nodemailer in package.json but the actual send calls are
TODOs), voice notes and file uploads (fields exist in the schema, no upload endpoint yet), badges /
streak automation, wearable integration, multilingual UI, PDF report export.

## Tech stack (as specified)

Frontend: React, TypeScript, Tailwind CSS, Framer Motion, React Router, Axios, Recharts
Backend: Node.js, Express, JWT, bcrypt, Socket.IO, Mongoose
AI: Python, FastAPI (rule-based NLP — see note above about upgrading to a real model)
