# Admin Panel Guide

## 🔐 Access

1. Navigate to: **http://localhost:3000/admin** or **https://ignite-gray.vercel.app/admin**
2. Enter PIN: **1234** (default)
3. You'll be redirected to the Song Editor

## 📝 Admin Pages

### 1. Song Editor (`/admin/songs`)
**Best for: Detailed editing of individual songs**

- **Search**: Find songs quickly
- **Expand/Collapse**: Click song card to expand
- **Edit Mode**: Click "Edit" button
  - Edit title, artist, key, CCLI number
  - Add/edit worship leaders with preferred keys
  - Add/remove/reorder sections
  - Edit chords and lyrics (snippets)
  - Add section notes
  - **Reorder sections**: Use ↑ ↓ arrows to move sections up/down
  - Save or cancel changes
- **Delete**: Remove songs permanently (with confirmation)
- **Download**: Export all songs as JSON backup

### 2. Bulk Editor (`/admin/bulk`)
**Best for: Quick edits across multiple songs**

- **Inline Editing**: Click any cell to edit
- **Select Multiple**: Use checkboxes
- **Bulk Actions**:
  - Change Key for multiple songs
  - Delete selected songs
- **Quick View**: Click "View" to see song details

## 📋 Song Data Structure

When editing `data/songs.json` directly, each song should have:

```json
{
  "id": "unique-id",              // Unique identifier
  "title": "Song Title",          // Required
  "artist": "Artist Name",        // Optional
  "originalKey": "G",             // Required - Original key of the song
  "defaultKey": "G",              // Required - Usually same as originalKey
  "songType": "Upbeat",           // "Upbeat" | "Slow" | "Moderate"
  "language": "English",          // "English" | "Tagalog"
  "ccli": "7095024",              // CCLI license number (optional)
  "worshipLeaders": [             // Array of leaders with preferred keys
    {
      "name": "YANNAH",           // UPPERCASE recommended
      "preferredKey": "D"         // Their preferred key for this song
    }
  ],
  "sections": [                   // Chord sections (required)
    {
      "id": "section_1234567890", // Unique section ID
      "name": "Verse 1",          // Section name (Intro, Verse, Chorus, etc.)
      "order": 1,                 // Order in song structure
      "chords": "G  D  Em  C",    // Chord progression (space-separated)
      "snippet": "First line...", // Lyrics snippet (optional)
      "notes": "Play softly"      // Section notes (optional)
    }
  ],
  "structure": ["Intro", "Verse 1", "Chorus"], // Song structure order
  "tags": [],                     // Tags for categorization
  "isActive": true,               // Active status
  "externalUrl": null             // External URL reference
}
```

### Important Fields:
- **songType**: Determines tempo icon (🔥 Upbeat, 💙 Slow, 💨 Moderate)
- **language**: Determines flag badge (🇬🇧 English, 🇵🇭 Tagalog)
- **worshipLeaders**: Names must match exactly across songs. Click their key to transpose.
- **sections**: Required for chords to display. Each section needs unique ID.
- **originalKey/defaultKey**: Both required for transpose functionality to work

## 💾 Saving Changes

### Method 1: Admin Panel Save (Recommended)
1. Make your edits in `/admin/songs` or `/admin/bulk`
2. Click **"Save"** button (green button in editor)
3. Changes saved to `data/songs.json` automatically
4. Commit and push to deploy:
   ```bash
   git add data/songs.json
   git commit -m "Update songs via admin panel"
   git push
   ```

### Method 2: Download JSON Backup
1. Make your edits
2. Click **"Download"** button in header
3. Save the downloaded `songs-YYYY-MM-DD.json` file
4. Use as backup or replace `data/songs.json` manually

## 🎵 Service Management

### Services Page (`/services`)
- **View all services**: Past and upcoming
- **Filter**: All | Upcoming | Past
- **Search**: Find services by title, worship leader, or description
- **Create**: Click "New Service" to create
- **Details**: Click any service card to view details

### Service Detail Page (`/services/[id]`)
**Song Management:**
- **Add Songs**: Click "Add Song" button → search → select song
- **Reorder**: Use ↑ ↓ arrows to reorder songs
- **Transpose**:
  - Click worship leader's key to instantly transpose
  - Use -1/+1 buttons for fine-tuning
  - **Keys are saved** and persist across page refreshes
- **Show Chords**: Click to expand/collapse chord display
- **Remove**: Click trash icon to remove song from service

**Team Management:**
- **Add Members**: Click "Add Team Member"
- **Assign Roles**: Multiple roles per member (Worship Leader, Vocals, Guitar, etc.)
- **Edit**: Click edit icon to modify roles and notes
- **Grouped Display**: Members grouped by role for clarity

**Performance Mode:**
- Click **"Performance Mode"** button to enter fullscreen view
- Features:
  - **Fullscreen**: Auto-enters fullscreen on mobile/desktop
  - **Navigation**: Swipe left/right, arrow keys, or foot pedal (PageUp/PageDown)
  - **Transpose**: Change key on the fly with dropdown
  - **Worship Leader Keys**: Click to switch to their preferred key
  - **Settings Panel**:
    - Compact Mode (with auto-fit font scaling)
    - Show/hide lyrics
    - Nashville Numbers (with/only)
    - Show/hide notes
    - Font size (S/M/L)
  - **Quick Jump**: Press J or click List icon to jump to any song
  - **Help**: Press ? or H for keyboard shortcuts
  - **Exit**: Press ESC, click red X, or swipe down from top

## 🔢 Nashville Number System

The app includes a Nashville Number System converter that displays chord numbers below chords:

**How it works:**
- Converts chords to scale degrees (1-7)
- Shows relationship to the key
- Makes transposing easier for musicians
- Example in key of C:
  - C → 1
  - G → 5
  - Am → 6m
  - F → 4

**Advanced Features:**
- Slash chords: G/B → 5/7
- Complex chords: C-D → 3-4 (all note names convert)
- Bass notes: G/A-C → 5/6-1 (bass note suffix converts too)

**Display Options:**
- **With Nashville Numbers**: Shows both chords and numbers
- **Nashville Numbers Only**: Shows only numbers (great for Nashville-familiar musicians)

## 🔧 Changing the PIN

Edit `.env.local` file:
```
NEXT_PUBLIC_ADMIN_PIN=your_new_pin
```

Then restart the dev server.

## ⚠️ Important Notes

- **Auto-save**: Changes save to JSON file on server
- **Version Control**: Always commit `data/songs.json` to git after changes
- **Service Keys**: Transposed keys are saved to database automatically
- **Team Members**: Stored in Supabase database (separate from songs)
- **Backup**: Download JSON regularly as backup

## 📱 Mobile Usage

- Works great on mobile devices
- Large touch targets (44px minimum)
- Responsive design adapts to screen size
- Swipe-friendly cards and navigation
- Performance Mode optimized for tablets/phones
- Touch gestures in Performance Mode:
  - Swipe left: Next song
  - Swipe right: Previous song
  - Swipe down from top: Exit

## 🚀 Deployment Workflow

### **Option 1: Edit Locally (Recommended)**

```bash
# 1. Open VS Code
cd D:\janversantos\Ignite\ignite-chords-app
code data/songs.json

# 2. Make changes directly in JSON file

# 3. Verify JSON is valid
node -e "JSON.parse(require('fs').readFileSync('data/songs.json', 'utf8'))"

# 4. Test locally
npm run dev
# Visit http://localhost:3000/songs

# 5. Commit and push
git add data/songs.json
git commit -m "Update songs: [describe changes]"
git push origin main

# 6. Update version (for auto-update banner)
# Edit lib/version.ts → increment APP_VERSION
# Example: export const APP_VERSION = '1.0.14'
git add lib/version.ts
git commit -m "Bump version to 1.0.14"
git push origin main

# 7. Vercel auto-deploys in ~1-2 minutes
# Users see update banner → tap reload → get fresh version
```

### **Option 2: Edit via Admin Panel (For Single Songs)**

```bash
# 1. Login
https://ignite-gray.vercel.app/admin

# 2. Edit songs
/admin/songs or /admin/bulk

# 3. Click "Save" button
# Changes saved to server

# 4. Pull changes locally
git pull origin main

# 5. Update version
# Edit lib/version.ts, increment APP_VERSION

# 6. Deploy
git add lib/version.ts
git commit -m "Bump version to 1.0.14"
git push origin main
```

## 🎯 Tips & Best Practices

- **Song Editor**: Use for detailed chord/section editing
- **Bulk Editor**: Use for quick metadata updates (keys, artists, types)
- **Search**: Works in both editors - very fast
- **Logout**: Always logout when done for security
- **Backup**: Download JSON regularly as backup before major edits
- **Version Updates**: Always increment version number after deploying changes
- **Team Members**: Use real names for better clarity
- **Worship Leader Keys**: Set these up - they appear as quick-transpose buttons
- **Performance Mode**: Test on actual device before service for best experience
- **Nashville Numbers**: Enable in settings if your team uses the number system

## 🔄 Auto-Update System

The app includes an auto-update detection system:

- Checks for new version every 30 seconds
- Shows blue banner when update is available: "New version available!"
- Users tap "Reload" to get latest version
- Clears cache and localStorage automatically on reload
- Version displayed in navbar (desktop) and menu (mobile)

**To trigger update banner:**
1. Make your changes and deploy to Vercel
2. Update `lib/version.ts`:
   ```typescript
   export const APP_VERSION = '1.0.14'  // Increment this
   export const APP_BUILD_DATE = '2025-10-02'
   export const APP_NAME = 'Ignite Chords'
   ```
3. Commit and push (Vercel rebuilds automatically)
4. After 30 seconds, users see update banner

**Version Display:**
- Desktop: Navbar (top right) shows "v1.0.14"
- Mobile: Menu → bottom shows "Version 1.0.14"

## 🔗 Quick Links

**Local Development:**
- Login: http://localhost:3000/admin
- Song Editor: http://localhost:3000/admin/songs
- Bulk Editor: http://localhost:3000/admin/bulk
- View Songs: http://localhost:3000/songs
- Services: http://localhost:3000/services

**Production:**
- Login: https://ignite-gray.vercel.app/admin
- Song Editor: https://ignite-gray.vercel.app/admin/songs
- Services: https://ignite-gray.vercel.app/services

## 📊 Current Version

**Latest Version:** 1.0.13 (October 2, 2025)

**Recent Updates:**
- Performance Mode with fullscreen support
- Swipe gestures for mobile navigation
- Nashville Numbers Only display mode
- Auto-fit font scaling in compact mode
- Service song key persistence to database
- Team members management
- Mobile exit controls with swipe-down gesture
