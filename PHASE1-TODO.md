# Phase 1 - Remaining Tasks

## Status: Foundation Complete ✅

### What's Done:
- ✅ Supabase client installed
- ✅ Service API methods created (`lib/supabase.ts`)
- ✅ SQL schema ready (`lib/services-schema.sql`)
- ✅ Setup guide created
- ✅ Mobile optimization complete
- ✅ Worship leaders display with keys

---

## Next: Build the UI Components

### 1. Dashboard Homepage (`app/page.tsx`)

**Features to add:**
- Quick stats section (total songs, most used key, leader count)
- Upcoming services cards (next 3-4 services)
- Key distribution chart
- Most used songs (top 5)
- Keep chord transposer sidebar

**Files to modify:**
- `app/page.tsx` - Update to dashboard layout
- Create `components/QuickStats.tsx`
- Create `components/UpcomingServices.tsx`
- Create `components/KeyDistribution.tsx`
- Create `components/MostUsedSongs.tsx`

---

###2. Service Detail Page (`app/services/[id]/page.tsx`)

**Create new route:**
```
app/services/
└── [id]/
    └── page.tsx
```

**Features:**
- Service header (title, date, time, leader)
- Song list with order
- Add song button (search/select from JSON songs)
- Remove song button
- Reorder songs (up/down arrows or drag-drop)
- Edit song key for this service
- Add notes per song
- Print/export setlist button

**Components to create:**
- `components/ServiceDetail.tsx`
- `components/AddSongModal.tsx`
- `components/ServiceSongList.tsx`

---

### 3. API Routes (Optional - can use client-side Supabase)

If you want server-side API:

**Create:**
```
app/api/services/
├── route.ts           # GET all, POST create
└── [id]/
    └── route.ts      # GET one, PUT update, DELETE
```

**Or:** Just use `SupabaseService` methods directly from components (simpler for Phase 1)

---

## Implementation Order:

### Step 1: Dashboard Homepage
1. Modify `app/page.tsx`
2. Create stats components
3. Fetch services from Supabase
4. Display upcoming services as cards
5. Add "Create Service" button

### Step 2: Service CRUD
1. Add create service modal/form
2. Test creating a service
3. Verify it appears in upcoming services

### Step 3: Service Detail Page
1. Create route `app/services/[id]/page.tsx`
2. Fetch service + songs from Supabase
3. Display service info
4. Show songs list (empty at first)

### Step 4: Add/Remove Songs
1. Create "Add Song" modal
2. Search/filter JSON songs
3. Add selected song to service
4. Test removing songs

### Step 5: Song Management
1. Add reorder functionality (up/down buttons)
2. Add key override per song
3. Add notes per song
4. Test full workflow

---

## Quick Start Commands:

```bash
# Resume work
cd ignite-chords-app
npm run dev

# Create new component
# Create file: components/ComponentName.tsx

# Create new route
# Create folder: app/route-name/page.tsx
```

---

## Example: Dashboard Homepage Structure

```tsx
// app/page.tsx
export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        <QuickStats />
        <UpcomingServices />
        <KeyDistribution />
        <MostUsedSongs />
      </div>

      {/* Sidebar (1/3 width) */}
      <div className="space-y-6">
        <ChordTransposer />
        <QuickActions />
      </div>
    </div>
  )
}
```

---

## Testing Checklist:

- [ ] Can create a service
- [ ] Service appears in dashboard
- [ ] Can click service to view details
- [ ] Can add songs from JSON to service
- [ ] Can remove songs from service
- [ ] Can reorder songs
- [ ] Can set custom key per song
- [ ] Changes persist (refresh page)
- [ ] Mobile responsive
- [ ] No console errors

---

## When Stuck:

**Use this prompt:**
```
You are my coding assistant.

[Paste MEGA-CONTEXT-PACK.md here]

Current task: [Describe what you're building]
Current issue: [Describe the problem]

Files involved:
- [List relevant files]
```

---

## Deployment Checklist:

Before deploying:
1. [ ] Run Supabase SQL schema
2. [ ] Set environment variables in Vercel
3. [ ] Test locally first
4. [ ] Push to GitHub
5. [ ] Deploy via Vercel
6. [ ] Test production site
7. [ ] Create first service in production

---

**Next session:** Start with Dashboard Homepage!
