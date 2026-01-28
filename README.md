# Persnl - Full-Stack Personal Dashboard

A modern, full-stack personal dashboard built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- 🔐 **Authentication**: Secure email/password login and signup via Supabase Auth.
- 📊 **Dashboard**: Summary charts for monthly expenses and task completion progress.
- 💸 **Expense Tracker**: Log spending with categories, dates, and notes.
- 🥗 **Meal Tracker**: Record daily meals with timestamps and nutrition notes.
- 📝 **Task Manager**: Organize tasks with priority, status, and due dates.
- 📅 **Calendar**: Unified view of all tasks, meals, and expenses.
- 🎨 **Modern UI**: Clean, responsive design with "Persnl" aesthetic and dark mode support.
- 🛡️ **Privacy**: Row Level Security (RLS) ensures only YOU can see your data.

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Recharts
- **Calendar**: FullCalendar

## Setup Instructions

### 1. Supabase Backend
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase/schema.sql` from this project and run it.
4. This will create the necessary tables, enums, indexes, and RLS policies.

### 2. Environment Variables
1. Create a `.env` file in the root directory (or copy `.env.example`).
2. Add your Supabase project URL and Anon Key:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
   *You can find these in Project Settings > API.*

### 3. Frontend Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Database Schema Highlights

- **expenses**: `amount`, `category`, `note`, `date`
- **meals**: `meal_type` (Enum), `timestamp`, `notes`
- **tasks**: `title`, `description`, `status` (Enum), `priority` (Enum), `due_date`
- **calendar_events**: (Handled dynamically in UI by polling the above tables)

## Best Practices Followed
- **RLS (Row Level Security)**: Every table has policies to ensure `auth.uid() = user_id`.
- **Responsive Design**: Sidebar turns into a mobile-friendly layout (standard Tailwind).
- **Type Safety**: Full TypeScript support for Supabase and React components.
- **Rich Aesthetics**: Custom HSL color tokens for a premium feel.
