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

### Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Lucide React
- **State/Auth**: Supabase Auth Helpers

### Backend (`/backend`)
- **Server**: Node.js with Express
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **CV Parsing**: `pdf-parse`, `mammoth`
- **AI/LLM**: Google Gemini (via n8n)

### Infrastructure
- **Workflows**: n8n (Webhooks for parsing, search, and email)
- **Database & Auth**: Supabase

## 📁 Project Structure

```
hr-cv-matcher/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                  # App Router pages and layouts
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities and Supabase client
│   └── public/               # Static assets
├── backend/                  # Express Backend Server
│   ├── src/
│   │   ├── services/         # Business logic (CV processing, Search)
│   │   ├── middleware/       # Auth and error handling
│   │   └── index.ts          # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Supabase Project
- n8n Instance (Self-hosted or Cloud)
- Google Gemini API Key

### 1. Installation

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the `frontend` directory and a `.env` file in the `backend` directory.

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

**Backend (`backend/.env`):**
```env
PORT=4000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_UPLOAD=your_n8n_upload_webhook
N8N_WEBHOOK_SEARCH=your_n8n_search_webhook
N8N_WEBHOOK_SEND_MAIL=your_n8n_email_webhook
FRONTEND_URL=http://localhost:3000
```

### 3. Running the Project

**Start Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

**Start Frontend:**
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
