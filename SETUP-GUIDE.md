# 🚀 Ignite Chords - Setup Guide (Phase 1: Hybrid)

## Overview

This guide will help you set up Ignite Chords with the **hybrid architecture**:
- **Songs**: Stored in JSON files (`data/songs.json`) - git-tracked
- **Services**: Stored in Supabase database - persistent, multi-user

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free tier works great!)
- Vercel account for deployment (optional)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: ignite-chords (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is perfect
5. Wait for project to be created (~2 minutes)

### 1.2 Get Your API Keys

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

### 1.3 Run SQL Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `lib/services-schema.sql` in this project
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### 1.4 Verify Tables

1. Go to **Table Editor** in Supabase
2. You should see two new tables:
   - `services`
   - `service_songs`
3. Click on each to verify the schema

---

## Step 2: Local Development Setup

### 2.1 Clone/Setup Project

```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd ignite-chords-app

# Install dependencies
npm install
```

### 2.2 Configure Environment Variables

1. Copy the example env file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and update with YOUR Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

### 2.3 Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` (or 3002 if 3000 is taken)

---

## Step 3: Verify Everything Works

### 3.1 Check Songs (JSON)

1. Go to homepage `/`
2. You should see songs loaded from `data/songs.json`
3. Try filtering by key, leader, etc.

### 3.2 Test Supabase Connection

Open browser console and run:
```javascript
// This will test if Supabase is connected
fetch('/api/services').then(r => r.json()).then(console.log)
```

If you see an empty array `[]`, Supabase is connected! ✅

---

## Step 4: Deploy to Production

### 4.1 Push to GitHub

```bash
git add .
git commit -m "Phase 1: Hybrid implementation"
git push origin main
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
7. Click "Deploy"
8. Wait ~2 minutes for deployment

### 4.3 Test Production Site

1. Vercel will give you a URL: `https://your-project.vercel.app`
2. Visit it and verify:
   - Songs display correctly
   - You can navigate to `/songs`
   - Admin panel works at `/admin`

---

## Step 5: Create Your First Service

### Via Dashboard (Coming in Phase 1):

1. Go to homepage `/`
2. Click "Create Service" button
3. Fill in:
   - Title: "Sunday Morning Service"
   - Date: Pick a date
   - Time: "09:00 AM"
   - Worship Leader: Your name
4. Click "Create"
5. Add songs to the service
6. View the setlist!

---

## Troubleshooting

### Issue: "Invalid API key" or "Auth error"

**Solution:**
1. Double-check your `.env.local` file
2. Make sure you copied the **anon/public** key, not service_role key
3. Restart dev server after changing `.env.local`

### Issue: "Table 'services' does not exist"

**Solution:**
1. Go back to Step 1.3
2. Run the SQL schema again in Supabase
3. Verify tables exist in Table Editor

### Issue: "401 Unauthorized" when creating service

**Solution:**
1. Go to Supabase → **Authentication** → **Policies**
2. Check that RLS policies are set correctly
3. Make sure "Allow all operations" policy exists for both tables

### Issue: Songs not loading

**Solution:**
1. Check that `data/songs.json` exists
2. Verify JSON is valid (use JSON validator)
3. Check console for errors

### Issue: "Module not found: @supabase/supabase-js"

**Solution:**
```bash
npm install @supabase/supabase-js
```

---

## File Structure Reference

```
ignite-chords-app/
├── lib/
│   ├── supabase.ts              # Supabase client + service methods
│   ├── services-schema.sql      # SQL to run in Supabase
│   └── songsData.ts             # Songs from JSON
├── data/
│   └── songs.json               # SONGS DATA (version controlled)
├── .env.local                   # Your Supabase credentials (DON'T COMMIT)
├── .env.local.example           # Template for env vars
└── SETUP-GUIDE.md               # This file
```

---

## Next Steps (Phase 1 Completion)

- [ ] Build dashboard homepage with stats
- [ ] Create service detail page
- [ ] Add service CRUD functionality
- [ ] Test on mobile devices
- [ ] Share with worship team!

---

## Phase 2 (Future)

When ready to migrate songs to database:
1. Create songs table in Supabase
2. Import JSON data (one-time script)
3. Update SongsService to query database
4. Keep UI exactly the same!

---

## Support

If you run into issues:
1. Check the browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables are set
4. Make sure SQL schema was run successfully

---

## Security Notes

**Current Setup (Phase 1):**
- ✅ Supabase RLS allows all operations (public app)
- ⚠️ Anyone can create/edit services
- ⚠️ Admin panel protected by PIN only

**For Production (Recommended):**
- Add proper authentication (Supabase Auth)
- Restrict service creation to authenticated users
- Add role-based access control
- Use service_role key only on server

---

Last Updated: October 1, 2025
