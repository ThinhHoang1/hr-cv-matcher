# Deploying HR CV Matcher to Vercel

This project has been migrated to a fully "Serverless" architecture, meaning you only need to deploy the **Frontend**. The Backend logic has been integrated into Next.js API Routes.

## 1. Push Code to GitHub
Ensure you have committed and pushed your latest changes (including the new `src/lib/services` and updated `package.json`) to your GitHub repository.

## 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your repository (`hr-cv-matcher` or similar).

## 3. Configure Project Settings
In the "Configure Project" screen:

- **Framework Preset**: Next.js
- **Root Directory**: Click "Edit" and select **`frontend`** (This is crucial!).

## 4. Environment Variables
Expand the **"Environment Variables"** section and add the following keys from your `.env.local`:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your Anon Key)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Service Role Key - Starts with `eyJ...`)* |
| `GEMINI_API_KEY` | *(Your Gemini API Key)* |
| `N8N_WEBHOOK_UPLOAD` | `https://n8n-automations.betterscale.ai/webhook/cv-upload` |
| `N8N_WEBHOOK_SEND_MAIL` | `https://n8n-automations.betterscale.ai/webhook/send-invite` |

**Note**: You DO NOT need `NEXT_PUBLIC_BACKEND_URL` anymore as the backend is now built-in.

## 5. Deploy
Click **"Deploy"**.

Vercel will build your Next.js application. Since we migrated the logic:
- `process-cv` will run as a Serverless Function on Vercel.
- `search-candidates` will run as a Serverless Function.
- All dependencies (`pdf-parse`, `mammoth`, etc.) will be bundled automatically.

## 6. Verify
Once deployed, open your Vercel URL and test:
1. Upload a CV.
2. Run an AI Search.
3. Everything should work without a separate backend server!
