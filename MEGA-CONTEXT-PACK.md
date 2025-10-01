# 🎯 MEGA CONTEXT PACK - Ignite Chords (Updated for Phase 1 Hybrid Implementation)

## 1. Project Overview

- **Name:** Ignite Chords - Worship Songs Management System
- **Goal/Purpose:** A comprehensive web application for managing worship songs, chord progressions, and service lineups for churches. Enables worship leaders to:
  - Store songs with chord charts and transpose keys
  - Manage preferred keys per worship leader
  - Plan worship services with song lineups
  - View song statistics and key distributions
  - Use Nashville Number System for easier chord communication

- **Current Status:**
  - ✅ **Phase 1 (Hybrid) - COMPLETE:**
    - Songs managed via JSON files (data/songs.json) - git-tracked, local editing
    - Services managed via Supabase database - persistent, multi-user
    - All 82 songs have songType (Upbeat/Slow/Moderate) and language (English/Tagalog)
    - Service detail page with enhanced song cards
    - Hybrid chords view (collapsible with full song link)
    - Mobile-optimized responsive design
    - Hamburger menu navigation
    - Dashboard with stats and upcoming services
  - 📅 **Phase 2 (Future):** Migrate songs to database for multi-user editing

---

## 2. Tech Stack

### **Frontend:**
- Next.js 15.5.4 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)

### **Backend:**
- Next.js API routes
- Supabase (PostgreSQL with PostGREST) - **Services only**
- Static JSON files - **Songs only** (data/songs.json)

### **Database:**
- **Supabase (PostgreSQL)** - Services and service_songs tables
- **JSON files** - Songs data (version controlled in git)

### **Hosting:**
- **Recommended:** Vercel (free tier, native Next.js support, automatic deployments)
- **Alternative:** Netlify, GitHub Pages (with adapter), Railway
- **Database:** Supabase (free tier: 500MB, 2GB bandwidth/month)

### **Other Tools:**
- Nashville Number System converter (custom)
- Chord transposition utilities
- Web scraping for chord imports

---

## 3. File Structure (Complete)

```
ignite-chords-app/
├── app/
│   ├── page.tsx                          # Dashboard homepage (NEEDS UPDATE)
│   ├── layout.tsx                        # Root layout
│   ├── songs/
│   │   ├── page.tsx                      # Song library with filters
│   │   └── [id]/
│   │       ├── page.tsx                  # Song detail route
│   │       └── SongDetailClient.tsx      # Song view/edit/transpose ✅
│   ├── services/                         # NEW - Service management (TO CREATE)
│   │   └── [id]/
│   │       └── page.tsx                  # Service detail page
│   ├── admin/
│   │   ├── page.tsx                      # Admin login
│   │   ├── layout.tsx                    # Admin layout
│   │   ├── songs/page.tsx                # Card view editor ✅
│   │   └── bulk/page.tsx                 # Bulk table editor ✅
│   └── api/
│       ├── scrape/route.ts               # URL scraping
│       ├── songs/save/route.ts           # Save songs to JSON
│       └── services/                     # NEW - Service API routes (OPTIONAL)
│           ├── route.ts                  # GET all, POST create
│           └── [id]/route.ts             # GET, PUT, DELETE service
├── components/
│   ├── Navbar.tsx                        # Navigation with hamburger ✅
│   ├── SongDashboard.tsx                 # Song list component ✅
│   ├── SongTable.tsx                     # Table view ✅
│   ├── SongCard.tsx                      # Grid card view ✅
│   ├── SongEditor.tsx                    # Song form
│   ├── ChordTransposer.tsx               # Chord widget
│   ├── AdminProtected.tsx                # Admin guard
│   ├── ThemeToggle.tsx                   # Dark mode
│   └── [TO CREATE]                       # Service components
│       ├── QuickStats.tsx                # Dashboard stats
│       ├── UpcomingServices.tsx          # Service cards
│       ├── KeyDistribution.tsx           # Key chart
│       ├── MostUsedSongs.tsx             # Top songs
│       ├── ServiceDetail.tsx             # Service page
│       └── AddSongModal.tsx              # Add song to service
├── lib/
│   ├── songsData.ts                      # Songs from JSON ✅
│   ├── supabase.ts                       # Supabase client + service methods ✅
│   ├── services-schema.sql               # Database schema ✅
│   └── nashvilleConverter.ts             # Nashville system
├── utils/
│   └── chordTransposer.ts                # Transpose logic
├── contexts/
│   └── AdminAuthContext.tsx              # Admin auth
├── data/
│   └── songs.json                        # SONGS DATA SOURCE (git-tracked)
├── types/
│   └── database.ts                       # Supabase types
├── SETUP-GUIDE.md                        # Setup instructions ✅
├── PHASE1-TODO.md                        # Remaining tasks ✅
├── MEGA-CONTEXT-PACK.md                  # This file ✅
└── [config files]
```

---

## 4. Architecture Decision: Hybrid Approach

### **Why Hybrid?**

**Songs → JSON Files (Static)**
- ✅ Easy bulk editing in VS Code
- ✅ Git version control
- ✅ Simple admin panel workflow
- ✅ Fast reads (no DB calls)
- ✅ Easy backup/export

**Services → Supabase Database (Dynamic)**
- ✅ Multi-user service planning
- ✅ Persistent across deploys
- ✅ Real-time updates
- ✅ Weekly changes need DB

### **Migration Path (Future):**
When ready for Phase 2, songs can be migrated to Supabase:
1. Create songs table
2. Import JSON data (one-time)
3. Update SongsService to use DB
4. Keep admin UI the same

**Estimated effort:** ~1 hour

---

## 5. Database Schema (Supabase)

### **services table:**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT,
  worship_leader TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **service_songs junction table:**
```sql
CREATE TABLE service_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL, -- References JSON songs by ID
  order_index INT NOT NULL,
  key TEXT, -- Override key for this service
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Full schema:** See `lib/services-schema.sql`

---

## 6. Key Features Implemented

### **✅ Mobile Optimization:**
- Hamburger menu for navigation (< 768px)
- Auto-grid view on mobile (prioritizes grid, allows table)
- Responsive controls (stack vertically)
- Touch-friendly buttons (44px min height)
- Responsive filter layout (grid stacking)

### **✅ Worship Leaders Display:**
- Multiple leaders with preferred keys shown
- Card view: Purple badges with name (key)
- Table view: Compact badges with wrapping
- Admin pages: Editable leader keys

### **✅ Song Management:**
- Removed "Default Key" - uses Original Key
- Original Key syncs to defaultKey internally
- Admin card view for detailed editing
- Admin bulk view for quick edits
- Import from URL

### **✅ Supabase Integration (NEW):**
- Service CRUD methods ready
- Song-to-service linking
- Reordering functionality
- Key override per service
- SQL schema prepared

### **🔄 Dashboard Homepage (Pending):**
- Quick stats (total songs, most used key, leaders)
- Upcoming services cards (next 3-4)
- Key distribution chart
- Most used songs (top 5)
- Chord transposer sidebar

### **🔄 Service Management (Pending):**
- Create/edit services
- Add/remove songs to service
- Reorder songs
- Set keys per song per service
- Print/export set lists

---

## 7. Coding Conventions

### **Language Style:**
- TypeScript with strict typing
- React functional components with hooks
- ES6+ features (async/await, destructuring, arrow functions)
- Tailwind CSS for styling (utility-first)

### **State Management:**
- useState for local state
- useEffect for data fetching
- Context API for admin auth
- No Redux/Zustand (keeping simple)

### **Error Handling:**
- Try-catch blocks with console.error
- User-friendly alerts for errors
- Graceful fallbacks for missing data
- Defensive checks for null/undefined

### **API Style:**
- RESTful endpoints
- Supabase: `.select()`, `.insert()`, `.update()`, `.delete()`
- JSON files: SongsService helper methods
- Next.js API routes for server operations

### **File Naming:**
- PascalCase for components (SongCard.tsx)
- camelCase for utilities (chordTransposer.ts)
- kebab-case for routes (songs/[id])
- UPPERCASE for constants

---

## 8. Environment Setup

### **Required Environment Variables:**

**.env.local:**
```bash
# Supabase (Services only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin (optional - for PIN protection)
ADMIN_PIN=1234
```

**.env.local.example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PIN=1234
```

---

## 9. Editing Songs Locally (Git Workflow)

### **Option 1: Edit JSON Directly (Recommended for Bulk Changes)**

1. **Open VS Code:**
   ```bash
   cd D:\janversantos\Ignite\ignite-chords-app
   code data/songs.json
   ```

2. **Make Your Changes:**
   - Add new songs
   - Update existing song fields (title, artist, key, chords, etc.)
   - Add/modify songType: "Upbeat" | "Slow" | "Moderate"
   - Add/modify language: "English" | "Tagalog"

3. **Verify JSON is Valid:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('data/songs.json', 'utf8'))"
   ```
   If no error, JSON is valid ✅

4. **Test Locally:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000/songs to verify changes

5. **Commit and Push to GitHub:**
   ```bash
   git add data/songs.json
   git commit -m "Update songs: [describe changes]"
   git push origin main
   ```

6. **Vercel Auto-Deploy:**
   - Vercel detects the push and deploys automatically (~1-2 minutes)
   - Visit https://ignite-gray.vercel.app to see live changes

### **Option 2: Use Admin Panel (Recommended for Single Song Edits)**

1. **Visit Admin Panel:**
   - Go to https://ignite-gray.vercel.app/admin
   - Enter PIN (set in ADMIN_PIN env var)

2. **Edit Songs:**
   - Card view: `/admin/songs` - Detailed editing
   - Bulk view: `/admin/bulk` - Quick edits in table format

3. **Save Changes:**
   - Click "Save All Changes"
   - This updates the JSON file on the server

4. **Download Updated JSON (if needed):**
   - Use browser dev tools to download the updated songs.json
   - Or pull from GitHub after Vercel commits

### **Song Data Structure:**

```json
{
  "id": "unique-id",
  "title": "Song Title",
  "artist": "Artist Name",
  "originalKey": "C",
  "defaultKey": "C",
  "songType": "Upbeat",        // "Upbeat" | "Slow" | "Moderate"
  "language": "English",       // "English" | "Tagalog"
  "worshipLeaders": [
    { "name": "LEADER_NAME", "preferredKey": "D" }
  ],
  "sections": [
    {
      "id": "section_id",
      "name": "Verse 1",
      "order": 1,
      "chords": "C  G  Am  F",
      "snippet": "First line of lyrics...",
      "notes": ""
    }
  ],
  "structure": ["Intro", "Verse 1", "Chorus"],
  "tags": [],
  "ccli": "",
  "isActive": true,
  "externalUrl": null
}
```

### **Common Commands:**

```bash
# Start dev server
npm run dev

# Check JSON validity
node -e "JSON.parse(require('fs').readFileSync('data/songs.json', 'utf8'))"

# Add metadata to songs (bulk script)
node scripts/add-song-metadata.js

# Git workflow
git status                           # Check what changed
git diff data/songs.json            # Review changes
git add data/songs.json             # Stage changes
git commit -m "Update songs"        # Commit
git push origin main                # Deploy to Vercel
```

---

## 10. Supabase Service Methods (lib/supabase.ts)

```typescript
// Services
SupabaseService.getServices()
SupabaseService.getServiceById(id)
SupabaseService.createService(service)
SupabaseService.updateService(id, updates)
SupabaseService.deleteService(id)

// Service Songs
SupabaseService.addSongToService(serviceSong)
SupabaseService.removeSongFromService(id)
SupabaseService.updateServiceSong(id, updates)
SupabaseService.reorderServiceSongs(songs)
```

---

## 11. Deployment (Vercel + Supabase)

### **Step 1: Supabase Setup**
1. Create account at supabase.com
2. Create new project
3. Run SQL schema (from `lib/services-schema.sql`)
4. Copy project URL and anon key
5. Add to environment variables

### **Step 2: Vercel Deployment**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PIN` (optional)
4. Deploy

### **Step 3: Post-Deploy**
1. Test service creation
2. Verify song display (from JSON)
3. Check admin panel access
4. Test on mobile device

**Full instructions:** See `SETUP-GUIDE.md`

---

## 12. Known Issues / Pending Tasks

### **✅ Completed (Latest Session - Oct 1, 2025):**
- ✅ View mode toggle (Full/Compact/Chords Only) on song detail page
- ✅ Chords only view optimization (vertical layout)
- ✅ Multi-line chord editing with "+ Line" button
- ✅ Service information editing functionality
- ✅ Song clickability in service detail page
- ✅ Sort options added to all pages (A-Z, Newest First)
  - /songs page
  - /admin/songs page
  - Home page (Most Popular Songs)
- ✅ Fixed hydration mismatch error on home page
- ✅ Fixed transpose dropdown (removed duplicate keys)
- ✅ Created .gitignore file for deployment

### **✅ Previously Completed:**
- ✅ Remove Default Key field
- ✅ Show all worship leaders with keys
- ✅ Mobile responsive navigation
- ✅ Mobile responsive song detail page
- ✅ Mobile responsive filters
- ✅ Auto-grid view on mobile
- ✅ Song cards clickable to detail page
- ✅ Show song type and language in cards
- ✅ Supabase client setup
- ✅ Service database methods
- ✅ SQL schema created
- ✅ Dashboard homepage built
- ✅ Service detail page functional
- ✅ Service CRUD UI complete
- ✅ Add/remove songs to services working

### **⏳ Phase 2 (Future):**
- ⏳ Migrate songs to database
- ⏳ Multi-user song editing
- ⏳ Real-time collaboration
- ⏳ Song versioning/history
- ⏳ User authentication
- ⏳ Advanced search/filtering
- ⏳ Bulk operations
- ⏳ Export functionality (PDF, CSV)
- ⏳ Service templates
- ⏳ Setlist sharing

---

## 13. Example Prompt Templates

### **For continuing Phase 1 work:**
```
You are my coding assistant.

Context: Ignite Chords - Next.js 15.5.4 worship management app
Architecture: Hybrid (Songs=JSON, Services=Supabase DB)
Status: Phase 1 foundation complete, building UI components

[Paste this entire MEGA-CONTEXT-PACK.md]

Task: Continue building [dashboard homepage / service management / API routes]
```

### **For database/Supabase issues:**
```
You are my coding assistant.

Context: Ignite Chords - Hybrid architecture
- Songs: JSON files (data/songs.json)
- Services: Supabase PostgreSQL

Database schema:
- services table (id, title, date, time, description, worship_leader)
- service_songs table (id, service_id, song_id, order_index, key, notes)

Current issue: [describe Supabase error]

Task: [Fix RLS policy / Schema update / API route debug]
```

### **For frontend/component issues:**
```
You are my coding assistant.

Context: Ignite Chords - React/TypeScript with Tailwind CSS
Mobile-first design, responsive grid/table views

Key components:
- SongDashboard.tsx: List with filters
- SongCard.tsx: Grid card with worship leaders
- ServiceManager.tsx: Service CRUD (to be built)

Current issue: [describe UI bug]

Task: [Responsive fix / Component update / Styling issue]
```

### **For deployment issues:**
```
You are my coding assistant.

Context: Ignite Chords deployment
- Frontend: Vercel
- Database: Supabase (free tier)
- Environment vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

Current issue: [describe deployment error]

Task: [Environment config / Build error / Deployment fix]
```

---

## 14. Quick Reference Commands

### **Development:**
```bash
cd "D:\janversantos\Ignite\ignite-chords-app"
npm run dev          # Start dev server (usually port 3000/3002)
npm run build        # Production build
npm run type-check   # TypeScript checking
```

### **Database:**
```bash
# Access Supabase project
https://app.supabase.com/project/[your-project-id]

# Run SQL queries
# Go to SQL Editor in Supabase dashboard
# Paste contents of lib/services-schema.sql
```

### **Git:**
```bash
git status
git add .
git commit -m "Phase 1: Hybrid implementation with dashboard"
git push origin main
```

---

## 15. Important Notes

### **Data Flow:**
```
Songs:
  JSON file → SongsService.getSongs() → Components

Services:
  Supabase → SupabaseService methods → Components → Supabase
```

### **Admin Access:**
- URL: `/admin`
- PIN: Set in .env.local (ADMIN_PIN)
- Protected routes: `/admin/songs`, `/admin/bulk`

### **File Editing:**
- Songs: Edit `data/songs.json` directly OR use admin panel
- Services: Use UI only (stored in database)

### **Backup Strategy:**
- Songs: Committed to git automatically
- Services: Export from Supabase dashboard regularly

---

## 16. Success Criteria (Phase 1 Complete)

- [x] Songs display from JSON
- [x] Services stored in Supabase
- [x] Dashboard homepage with stats
- [x] Service detail page functional
- [x] Can create/edit/delete services
- [x] Can add/remove songs to services
- [x] Mobile responsive throughout
- [x] View mode toggle (Full/Compact/Chords Only)
- [x] Sort options on all pages
- [x] Multi-line chord editing
- [ ] Deployed to Vercel (Ready)
- [x] Supabase connected

---

## 17. Deployment Instructions

### **GitHub Setup:**
1. Create new repository: `https://github.com/janversantos/ignite`
2. Push code:
   ```bash
   cd "D:\janversantos\Ignite\ignite-chords-app"

   # Remove old remote and reinitialize
   git remote remove origin
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit: Ignite Chords worship song management app"

   # Connect to new repo
   git branch -M main
   git remote add origin https://github.com/janversantos/ignite.git
   git push -u origin main
   ```

### **Vercel Deployment:**
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import repository: `janversantos/ignite`
4. **Root Directory:** `ignite-chords-app`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rhcetkdysqnyypoeuttw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
   SUPABASE_URL=https://rhcetkdysqnyypoeuttw.supabase.co
   SUPABASE_ANON_KEY=[your-key]
   SUPABASE_SECRET_KEY=[your-secret-key]
   ```
6. Click "Deploy"

### **Supabase Configuration:**
- Add Vercel URL to Allowed Redirect URLs in Supabase dashboard
- Example: `https://your-app.vercel.app/*`

### **Post-Deployment Testing:**
- ✅ Test song browsing at `/songs`
- ✅ Test service creation at `/services`
- ✅ Test admin login at `/admin`
- ✅ Test transpose functionality
- ✅ Test on mobile device

### **Common Commands:**
```bash
# Resume development
cd ignite-chords-app
npm run dev

# Check build
npm run build

# Deploy
git push origin main  # Auto-deploys via Vercel
```

---

## 18. File References

- **Setup:** `SETUP-GUIDE.md`
- **Next Steps:** `PHASE1-TODO.md`
- **Database Schema:** `lib/services-schema.sql`
- **API Methods:** `lib/supabase.ts` (lines 226-365)
- **Songs Data:** `data/songs.json`

---

**Last Updated:** October 1, 2025
**Current Phase:** Phase 1 Complete - Ready for Deployment
**Next Milestone:** Deploy to Vercel and test production

---

## 🚀 PASTE THIS ENTIRE FILE TO RESUME WORK

*This Mega Context Pack contains everything needed to continue development. Simply paste it into a new chat session and specify what you want to work on next.*
