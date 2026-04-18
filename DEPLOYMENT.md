# Deployment Guide

## Read this first

If someone is setting this project up for the first time, start with:

- `README.md` for install and local setup
- this file for deployment values and hosting steps

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

Your password contains `@`, so it must be URL-encoded as `%40`.

Use this production connection string:

```env
MONGODB_URI=mongodb+srv://sino:sino%40123dx@cluster0.yylu84x.mongodb.net/afyacare?retryWrites=true&w=majority&appName=Cluster0
```

## Render backend env

Copy and paste this into the Render backend service:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://sino:sino%40123dx@cluster0.yylu84x.mongodb.net/afyacare?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=afyacare-super-secure-jwt-secret-2026
JWT_EXPIRE=7d
CORS_ORIGIN=https://africare.vercel.app
INTERNAL_API_KEY=afyacare-internal-api-key-2026
EMAIL_PROVIDER=gmail
SMTP_USER=dushimimanaorivier184@gmail.com
SMTP_PASS=osio dkfb bjcp xfer
EMAIL_FROM=dushimimanaorivier184@gmail.com
GOOGLE_API_KEY=AIzaSyBNhFaRz8e9NAAcRv7HwZhLDwHmtWqp4Do
GEMINI_MODEL=gemini-2.0-flash
TEST_PATIENT_EMAIL=sinoolivies@gmail.com
DEFAULT_ACCOUNT_PASSWORD=pass@123
```

Also saved in:

`backend/.env.render.example`

## Render AI service env

Copy and paste this into the Render AI service:

```env
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=10000
GOOGLE_API_KEY=AIzaSyBNhFaRz8e9NAAcRv7HwZhLDwHmtWqp4Do
GEMINI_MODEL=gemini-2.0-flash
NODE_API_BASE_URL=https://afyacare-backend.onrender.com/api/v1
INTERNAL_API_KEY=afyacare-internal-api-key-2026
REQUEST_TIMEOUT_SECONDS=30
```

Replace `NODE_API_BASE_URL` with your actual backend Render URL if you choose a different service name.

Also saved in:

`ai-service/.env.render.example`

## Vercel frontend env

Set this on Vercel:

```env
VITE_AI_SERVICE_URL=https://afyacare-ai-service.onrender.com
VITE_NODE_API_URL=https://afyacare-backend.onrender.com/api/v1
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
