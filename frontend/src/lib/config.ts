
export const CONFIG = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    N8N_WEBHOOK_UPLOAD: process.env.N8N_WEBHOOK_UPLOAD || '',
    N8N_WEBHOOK_SEND_MAIL: process.env.N8N_WEBHOOK_SEND_MAIL || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    // Add other keys as needed
};
