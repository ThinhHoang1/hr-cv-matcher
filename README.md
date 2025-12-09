# 🎯 HR CV Matcher - AI-Powered Recruitment Platform

A modern SaaS application for HR teams to upload CVs, leverage AI-powered RAG technology for candidate matching, and automate interview invitations.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## ✨ Features

- 📤 **Bulk CV Upload**: Upload hundreds of CVs (PDF, DOCX) with drag-and-drop
- 🤖 **AI Processing**: Automatic extraction of name, email, skills, experience via n8n
- 🔍 **RAG-Based Search**: Find best candidates using vector similarity search
- 📊 **Advanced Filtering**: Filter by skills, experience, keywords
- ✉️ **Auto Invitations**: Send bulk interview emails with one click
- 📈 **Dashboard Analytics**: Track candidates, invitations, and searches
- 🎨 **Beautiful UI**: Modern glassmorphism design with TailwindCSS
- 🔐 **Authentication**: Secure login with Clerk

## 🏗 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS with custom animations
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **AI Processing**: n8n workflows with RAG
- **Deployment**: Vercel
- **File Upload**: react-dropzone

## 📁 Project Structure

```
hr-cv-matcher/
├── app/
│   ├── api/
│   │   ├── upload-cvs/route.ts      # Upload CV API
│   │   ├── search-candidates/route.ts # AI search API
│   │   └── send-invitations/route.ts  # Email API
│   ├── dashboard/page.tsx            # Dashboard
│   ├── upload/page.tsx               # CV upload page
│   ├── candidates/page.tsx           # Candidate list
│   ├── search/page.tsx               # AI search page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── Navbar.tsx                    # Navigation
│   ├── StatsCard.tsx                 # Statistics cards
│   ├── SkillBadge.tsx                # Skill tags
│   └── LoadingSpinner.tsx            # Loading component
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── n8n.ts                        # n8n API functions
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Utility functions
├── DATABASE.sql                      # Database schema
├── DEPLOYMENT.md                     # Deployment guide
└── package.json
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd CV_HR_project
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# n8n Webhooks
N8N_WEBHOOK_UPLOAD=https://your-n8n/webhook/cv-upload
N8N_WEBHOOK_SEARCH=https://your-n8n/webhook/search
N8N_WEBHOOK_SEND_MAIL=https://your-n8n/webhook/send-invite

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
```

### 3. Setup Database

1. Create a Supabase project
2. Run `DATABASE.sql` in Supabase SQL Editor
3. Copy API keys to `.env.local`

### 4. Configure n8n Workflows

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed n8n setup.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

- **candidates**: Store candidate information
- **skills**: Master list of skills
- **candidate_skills**: Many-to-many relationship
- **job_descriptions**: Job postings
- **search_results**: Cache AI search results
- **invitations**: Track sent invitations

## 🔗 N8N Workflows Required

### 1. CV Upload Webhook
- **Endpoint**: `/webhook/cv-upload`
- **Function**: Extract data from PDF/DOCX using AI
- **Returns**: Structured candidate data

### 2. Search Webhook
- **Endpoint**: `/webhook/search`
- **Function**: RAG-based vector search for matching
- **Returns**: Ranked candidate list with scores

### 3. Email Webhook
- **Endpoint**: `/webhook/send-invite`
- **Function**: Send bulk interview invitations
- **Returns**: Success/failure status

## 🎨 UI Features

- ✅ Glassmorphism cards
- ✅ Gradient animations
- ✅ Drag-and-drop file upload
- ✅ Real-time progress tracking
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states
- ✅ Avatar generation

## 📱 Pages

1. **Landing** (`/`) - Marketing homepage
2. **Dashboard** (`/dashboard`) - Statistics overview
3. **Upload** (`/upload`) - Bulk CV upload
4. **Candidates** (`/candidates`) - Browse and filter
5. **Search** (`/search`) - AI-powered matching

## 🔐 Authentication

Using Clerk for secure authentication:
- Email/password login
- OAuth providers (Google, GitHub)
- Session management
- Protected routes

## 🚀 Deployment

Deploy to Vercel with one click:

```bash
npm i -g vercel
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

## 📈 Future Enhancements

- [ ] Video interview scheduling
- [ ] Candidate pipeline management
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Custom email templates
- [ ] Interview feedback forms
- [ ] Integration with ATS systems

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file

## 💡 Support

For issues and questions:
- Open GitHub issues
- Contact: your-email@example.com

---

**Built with ❤️ using Next.js, Supabase, and n8n**
