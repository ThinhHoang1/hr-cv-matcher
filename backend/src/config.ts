import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 4000,
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zwektghppstkzdrvboxk.supabase.co',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    // N8N Webhooks
    N8N_WEBHOOK_UPLOAD: process.env.N8N_WEBHOOK_UPLOAD || 'https://n8n-automations.betterscale.ai/webhook/cv-upload',
    N8N_WEBHOOK_SEND_MAIL: process.env.N8N_WEBHOOK_SEND_MAIL || 'https://n8n-automations.betterscale.ai/webhook/send-invite',
    FRONTEND_URLS: ['http://localhost:3000', process.env.FRONTEND_URL].filter((url): url is string => !!url),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyBeRlk2U79LJKZi-964WVjCiPeWx2tuMgM'
};
