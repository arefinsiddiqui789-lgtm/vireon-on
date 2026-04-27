# Vireon — CSE Productivity Hub

A comprehensive productivity web app built for Computer Science & Engineering students. Stay organized, study smarter, and keep track of your fitness goals — all in one place.

## ✨ Features

- **📊 Dashboard** — Overview of tasks, goals, streaks, and quick actions
- **📚 Study Planner** — Organize study tasks by subject and day of the week
- **🎯 Daily Goals** — Set and track up to 3 daily goals with streak counter
- **💪 Gym Routine** — Custom workout planner with exercise tracking and BMI calculator
- **💻 Code Compiler** — AI-powered code execution for Python, C, and C++
- **🤖 Vireon Bro** — AI chat assistant specialized in CSE topics
- **📅 Overview** — Calendar view of your productivity history

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: NextAuth.js v4 (Credentials + JWT)
- **State**: Zustand + localStorage persistence
- **Animations**: Framer Motion (fade-only)
- **AI**: z-ai-web-dev-sdk (chat + code execution)

## 🚀 Deployment (Vercel)

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Neon](https://neon.tech) account (free PostgreSQL database)
3. A [GitHub](https://github.com) account

### Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project called "vireon"
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`)

### Step 2: Push to GitHub

1. Create a new repository on GitHub called "vireon"
2. Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/vireon.git
   git add .
   git commit -m "Initial commit: Vireon v1.0"
   git push -u origin main
   ```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import your "vireon" repository
3. Configure environment variables:
   - `DATABASE_URL` = Your Neon connection string
   - `NEXTAUTH_SECRET` = Run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL` = Your Vercel domain (e.g., `https://vireon.vercel.app`)
4. Click **"Deploy"**
5. After deployment, run the database migration:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure all 3 env vars are set for Production, Preview, and Development
   - Go to Deployments → Latest → Redeploy (if needed)

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app's base URL | `https://vireon.vercel.app` |

## 💻 Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vireon.git
   cd vireon
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, and NEXTAUTH_URL
   ```

4. Set up database:
   ```bash
   bunx prisma migrate deploy
   ```

5. Run the dev server:
   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Support

Vireon is fully responsive with:
- Collapsible sidebar with hamburger menu
- Safe-area-aware layouts for iOS devices
- No auto-zoom on input focus (16px minimum font-size)
- Touch-friendly tap targets

## 👨‍💻 Author

Built by **Arefin Siddiqui** — CSE Student at IUB, Dhaka, Bangladesh

## 📄 License

MIT
