import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../db/supabase';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // --- AUTH BYPASS FOR DEBUGGING ---
        console.warn('⚠️ AUTH BYPASSED FOR DEBUGGING ⚠️');
        req.user = { id: 'debug-user-id', email: 'debug@example.com' };
        next();
        return;
        // ---------------------------------

        /*
        // 1. Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Missing Bearer token' });
        }

        // 2. Verify token with Supabase
        console.log('--- Auth Debug ---');
        console.log('Headers:', JSON.stringify(req.headers));
        console.log('Token extracted:', token.substring(0, 20) + '...');

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        console.log('Supabase User Check Result:', user ? 'Found User: ' + user.id : 'No User Found');
        if (error) console.log('Supabase Auth Error:', error.message);
        console.log('------------------');

        if (error) {
            console.error('❌ Supabase Auth Error Detail:', JSON.stringify(error, null, 2));
        }

        if (error || !user) {
            console.error('Auth Error:', error?.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // 3. Attach user to request and proceed
        req.user = user;
        next();
        */

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
