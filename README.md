# 🎯 HR CV Matcher - AI-Powered Recruitment Platform

A modern SaaS application for HR teams to upload CVs, leverage AI-powered RAG technology for candidate matching, and automate interview invitations.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)
![Express](https://img.shields.io/badge/Express-4-green)
![n8n](https://img.shields.io/badge/n8n-Workflow-orange)

## ✨ Features

- 📤 **Bulk CV Upload**: Upload hundreds of CVs (PDF, DOCX) via the dashboard.
- 🤖 **AI Processing**: Automatic extraction of candidate details (name, email, skills) using n8n workflows and AI.
- 🔍 **RAG-Based Search**: Find the best candidates using vector similarity search powered by Google Gemini embeddings.
- ✉️ **Auto Invitations**: Send interview invitations directly from the platform.
- 🔐 **Secure Access**: Role-based access control with Supabase Authentication.
- 📥 **Secure CV Download**: Securely view and download candidate CVs.

## 🏗 Tech Stack

### Full Stack Application (`/frontend`)
- **Framework**: Next.js 14 (App Router & API Routes)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Lucide React
- **State/Auth**: Supabase Auth Helpers
- **Server Logic**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **CV Parsing**: `mammoth`, `pdf-parse` (via Server Actions)
- **AI/LLM**: Google Gemini (Direct API integration)

### Infrastructure
- **Workflows**: n8n (Optional: for heavy background tasks)
- **Database & Auth**: Supabase

## 📁 Project Structure

```
hr-cv-matcher/
├── frontend/                 # Full Stack Next.js Application
│   ├── app/                  # App Router pages and API routes
│   │   ├── api/              # Backend API Routes (Serverless Functions)
│   │   └── ...               # UI Pages
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities, Services, and Supabase client
│   └── public/               # Static assets
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Supabase Project
- Google Gemini API Key
- (Optional) n8n Instance for background workflows

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the `frontend` directory:

**`frontend/.env.local`:**
```env
# Client Side (Public)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Side (Secret - do NOT expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
N8N_WEBHOOK_UPLOAD=your_n8n_upload_webhook
N8N_WEBHOOK_SEARCH=your_n8n_search_webhook
N8N_WEBHOOK_SEND_MAIL=your_n8n_email_webhook
```

### 3. Running the Project

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## 🔗 N8N Workflows

The system relies on n8n webhooks for heavy lifting:
1.  **CV Upload**: Receives file path, extracts text/metadata, generates embeddings, and updates Supabase.
2.  **Search Candidate**: Accepts a query, converts to vector, performs similarity search in Supabase.
3.  **Send Email**: Dispatches interview invitations.

## 🤝 Contributing

 Contributions are welcome! Please feel free to submit a Pull Request.
