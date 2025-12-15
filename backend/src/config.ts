import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 4000,
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // N8N Webhooks
    N8N_WEBHOOK_UPLOAD: process.env.N8N_WEBHOOK_UPLOAD,
    N8N_WEBHOOK_SEND_MAIL: process.env.N8N_WEBHOOK_SEND_MAIL,
    FRONTEND_URLS: ['http://localhost:3000', process.env.FRONTEND_URL].filter((url): url is string => !!url),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
};
