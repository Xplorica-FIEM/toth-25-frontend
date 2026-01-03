# Vercel Environment Variable Setup

## Required Environment Variables

Go to your Vercel project dashboard:
https://vercel.com/saikattanti/toth-25-frontend

Then navigate to: **Settings → Environment Variables**

Add the following environment variable:

### Frontend Environment Variables

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://toth-25-backend.vercel.app` | Production, Preview, Development |

## Steps:

1. Go to https://vercel.com/saikattanti/toth-25-frontend/settings/environment-variables
2. Click "Add New"
3. Enter key: `NEXT_PUBLIC_BACKEND_URL`
4. Enter value: `https://toth-25-backend.vercel.app`
5. Select all environments (Production, Preview, Development)
6. Click "Save"
7. Redeploy your application

## Redeploy

After adding the environment variable, you need to redeploy:
- Go to Deployments tab
- Click on the three dots (...) on the latest deployment
- Click "Redeploy"

OR simply push a new commit to trigger a deployment.

## Local Development

For local development, the `.env.local` file will be used automatically.

deployment 1 
