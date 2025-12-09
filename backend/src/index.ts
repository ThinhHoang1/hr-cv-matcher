import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { CvProcessingService } from './services/cv-processing.service';
import { CandidateService } from './services/candidate.service';
import { requireAuth } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

console.log('--- Environment Check ---');
console.log('N8N_WEBHOOK_UPLOAD:', process.env.N8N_WEBHOOK_UPLOAD);
console.log('N8N_WEBHOOK_SEND_MAIL:', process.env.N8N_WEBHOOK_SEND_MAIL);
console.log('-------------------------');

// --- SECURITY MIDDLEWARE ---

// 1. Helmet (Security Headers)
app.use(helmet());

// 2. CORS (Restrict Origins)
const allowedOrigins = [
    'http://localhost:3000', // Local Frontend
    process.env.FRONTEND_URL || '', // Production Frontend
    'https://cv-hr-project-frontend.vercel.app' // Example Vercel URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // TEMPORARY: Allow all for easier dev
        }
        return callback(null, true);
    },
    credentials: true
}));

// 3. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json());

// --- ROUTES ---

// Health check (Public)
app.get('/', (req, res) => {
    res.send('CV HR Backend is running');
});

// Process CV (Protected)
app.post('/api/process-cv', requireAuth, async (req, res) => {
    try {
        const { userId, filePath } = req.body;
        if (!userId || !filePath) {
            return res.status(400).json({ error: 'userId and filePath are required' });
        }

        const result = await CvProcessingService.processFile(userId, filePath);
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Candidates (Protected)
app.post('/api/search-candidates', requireAuth, async (req, res) => {
    try {
        const { query, limit, threshold } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const results = await CandidateService.search(query, limit, threshold);
        res.json({ results });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Send Invitations (Protected)
import { InvitationService } from './services/invitation.service';
app.post('/api/send-invitations', requireAuth, async (req, res) => {
    try {
        const result = await InvitationService.sendInvitations(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Questions (Protected)
import { QuestionService } from './services/question.service';
app.post('/api/generate-questions', requireAuth, async (req, res) => {
    try {
        const { candidateId } = req.body;
        if (!candidateId) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }
        const questions = await QuestionService.generateQuestions(candidateId);
        res.json({ questions });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Secure CV Download Proxy (Protected)
import { supabaseAdmin } from './db/supabase';
app.get('/api/secure-cv/:candidateId', requireAuth, async (req, res) => {
    try {
        const { candidateId } = req.params;

        // 1. Get Candidate File Path
        const { data: candidate, error: dbError } = await supabaseAdmin
            .from('candidates')
            .select('cv_file_path, name')
            .eq('id', candidateId)
            .single();

        if (dbError || !candidate || !candidate.cv_file_path) {
            return res.status(404).send('CV not found');
        }

        // 2. Download from Supabase Storage
        const { data: fileBlob, error: storageError } = await supabaseAdmin
            .storage
            .from('cvs')
            .download(candidate.cv_file_path);

        if (storageError || !fileBlob) {
            console.error('Storage download error:', storageError);
            return res.status(500).send('Failed to retrieve file');
        }

        // 3. Stream to Client
        const arrayBuffer = await fileBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = candidate.cv_file_path.split('/').pop() || 'cv.pdf';
        const contentType = fileName.endsWith('.pdf') ? 'application/pdf' :
            fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${candidate.name.replace(/[^a-z0-9]/gi, '_')}_CV.${fileName.split('.').pop()}"`);
        res.send(buffer);

    } catch (error: any) {
        console.error('Secure download error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
