# Deployment Guide

## Read this first

If someone is setting this project up for the first time, start with:

- `README.md` for install and local setup
- this file for deployment values and hosting steps
- `VERCEL_FRONTEND_DEPLOYMENT.md` for frontend-only hosting on Vercel

## Simple local start commands

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

Whole local stack:

```bash
npm run dev:all
```

## Pip check

Recommended setup for the AI service:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r ai-service/requirements.txt
```

If you want to check that `pip` exists:

```bash
python3 -m ensurepip --version
```

If `pip` is not on PATH, use:

```bash
python3 -m pip install -r ai-service/requirements.txt
```

If `.venv` exists, `npm run start:ai` and `npm run dev:all` will use it automatically.

## MongoDB Atlas production URI

Use your MongoDB Atlas production connection string.

If your password contains special characters like `@`, URL-encode them first.

```env
MONGODB_URI=mongodb+srv://db_user:db_password@cluster.mongodb.net/afyacare?retryWrites=true&w=majority&appName=Cluster0
```

## Render backend env

Copy and paste this into the Render backend service:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://db_user:db_password@cluster.mongodb.net/afyacare?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace-with-a-long-random-jwt-secret
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
INTERNAL_API_KEY=replace-with-your-internal-service-key
EMAIL_PROVIDER=gmail
SMTP_USER=your-gmail-address@example.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-gmail-address@example.com
GOOGLE_API_KEY=your-google-api-key
GEMINI_MODEL=gemini-2.0-flash
TEST_PATIENT_EMAIL=test-patient@example.com
DEFAULT_ACCOUNT_PASSWORD=replace-with-default-seed-password
```

Also saved in:

`backend/.env.render.example`

## Render AI service env

Copy and paste this into the Render AI service:

```env
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=10000
GOOGLE_API_KEY=your-google-api-key
GEMINI_MODEL=gemini-2.0-flash
NODE_API_BASE_URL=https://your-backend-service.onrender.com/api/v1
INTERNAL_API_KEY=replace-with-your-internal-service-key
REQUEST_TIMEOUT_SECONDS=30
```

Replace `NODE_API_BASE_URL` with your actual backend Render URL if you choose a different service name.

Also saved in:

`ai-service/.env.render.example`

## Vercel frontend env

Set this on Vercel:

```env
VITE_AI_SERVICE_URL=https://your-ai-service.onrender.com
VITE_NODE_API_URL=https://your-backend-service.onrender.com/api/v1
```

Replace the URLs with your actual Render service URLs if they differ.

## Local AI startup fix

Your current `npm run dev:all` output shows the backend and frontend are working, but the AI service is not installed locally yet:

```bash
/usr/bin/python3: No module named uvicorn
```

Install the AI dependencies, then rerun:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r ai-service/requirements.txt
npm run dev:all
```

If `python3 -m pip` is missing on your machine, install `python3-pip` first, or create a Python virtual environment that includes pip.
