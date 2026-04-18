# Vercel Frontend Guide

This file explains how to host the AfyaCare frontend on Vercel.

## What this deploys

This deploy is only for the React frontend in the project root.

The frontend depends on:

- the Node backend hosted on Render
- the AI service hosted on Render

## Before deploying

Make sure these two backend services are already online:

- backend API
- AI service

You will need their public URLs.

Example:

```env
Backend: https://afyacare-backend.onrender.com/api/v1
AI: https://afyacare-ai-service.onrender.com
```

## Vercel project settings

When creating the Vercel project, use these values:

- Framework Preset: `Vite`
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Environment variables on Vercel

Add these in the Vercel dashboard under Project Settings -> Environment Variables:

```env
VITE_NODE_API_URL=https://afyacare-backend.onrender.com/api/v1
VITE_AI_SERVICE_URL=https://afyacare-ai-service.onrender.com
```

Replace those URLs with your real Render service URLs.

If your frontend domain is:

```env
https://africare.vercel.app
```

then make sure your backend `CORS_ORIGIN` allows that exact URL.

## How to deploy from GitHub

1. Push the project to GitHub.
2. Go to Vercel.
3. Click `Add New Project`.
4. Import your GitHub repository.
5. Set the project settings shown above.
6. Add the two frontend environment variables.
7. Click `Deploy`.

## How to redeploy after changes

If the project is already linked to Vercel:

1. Push new commits to the connected branch.
2. Vercel will rebuild automatically.

If needed, you can also trigger a manual redeploy from the Vercel dashboard.

## Local check before Vercel deploy

Run this at the project root:

```bash
npm install
npm run build
```

If the build passes locally, the frontend is usually ready for Vercel.

## Common problems

### Frontend loads but API calls fail

Check:

- `VITE_NODE_API_URL` is correct
- `VITE_AI_SERVICE_URL` is correct
- backend `CORS_ORIGIN` includes your Vercel domain
- backend and AI services are already deployed and healthy

### Blank page after deploy

Check:

- build logs in Vercel
- environment variable names are exactly correct
- the frontend was deployed from the project root

## Recommended production frontend env

Copy and paste:

```env
VITE_NODE_API_URL=https://afyacare-backend.onrender.com/api/v1
VITE_AI_SERVICE_URL=https://afyacare-ai-service.onrender.com
```

## Related files

- [README.md](./README.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
