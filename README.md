# AfyaCare

AfyaCare is a multi-hospital healthcare platform with:

- `frontend`: Vite + React
- `backend`: Node.js + Express + MongoDB
- `ai-service`: FastAPI + LangChain + Google Gemini

## Project structure

```text
.
├── src/                 # frontend
├── backend/             # Node API
├── ai-service/          # FastAPI AI service
├── scripts/             # local start helpers
├── DEPLOYMENT.md        # deployment guide
└── render.yaml          # Render blueprint
```

## Requirements

- Node.js 18+
- npm
- Python 3.11+ or newer
- MongoDB local or MongoDB Atlas

## Local installation

### 1. Install frontend and backend packages

At the project root:

```bash
npm install
```

In the backend folder:

```bash
cd backend
npm install
cd ..
```

### 2. Install AI service packages

Recommended: use a virtual environment.

Create and activate the virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the AI packages:

```bash
python3 -m pip install -r ai-service/requirements.txt
```

If you do not want a virtual environment, you can install directly with:

```bash
python3 -m pip install -r ai-service/requirements.txt
```

## Environment variables

Create these local files:

- `.env` for frontend if needed
- `backend/.env`
- `ai-service/.env`

You can copy from:

- `backend/.env.example`
- `backend/.env.render.example`
- `ai-service/.env.render.example`

## Local start commands

Frontend only:

```bash
npm run start:frontend
```

Backend only:

```bash
npm run start:backend
```

AI service only:

```bash
npm run start:ai
```

Full local stack:

```bash
npm run dev:all
```

`scripts/start-ai-service.sh` now automatically uses `.venv` if it exists.

## Common AI service fix

If you see:

```bash
No module named uvicorn
```

run:

```bash
source .venv/bin/activate
python3 -m pip install -r ai-service/requirements.txt
```

Then start again:

```bash
npm run dev:all
```

## Deployment

For Render, Vercel, and MongoDB Atlas setup, read:

[DEPLOYMENT.md](./DEPLOYMENT.md)
