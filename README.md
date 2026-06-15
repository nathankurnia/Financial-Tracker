# Finance Tracker

A personal finance tracker built with Next.js and Supabase. Track your income and expenses across multiple accounts and categories.

## Features

- Email/password authentication and Google OAuth
- Multiple accounts with automatic balance updates
- Transaction management (income & expense) with category tagging
- Filter and sort transactions by type, account, category, date, or amount
- Dashboard with accounts and categories overview

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Forms:** React Hook Form + Zod
- **Language:** TypeScript

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd finance-tracker
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in the values in `.env.local` (see [Environment Variables](#environment-variables) below).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Your Supabase publishable API key |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for OAuth redirects (defaults to `http://localhost:3000`) |

Get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your [Supabase project API settings](https://supabase.com/dashboard/project/_/settings/api).

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Add the environment variables in the Vercel project settings
4. Set `NEXT_PUBLIC_BASE_URL` to your production URL (e.g. `https://your-app.vercel.app`)
5. In Supabase, add your production URL to the allowed redirect URLs under **Authentication → URL Configuration**

```bash
npm run build  # verify the build passes locally before deploying
```
