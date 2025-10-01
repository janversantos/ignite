# Admin Panel Guide

## 🔐 Access

1. Navigate to: **http://localhost:3000/admin**
2. Enter PIN: **1234** (default)
3. You'll be redirected to the Card Editor

## 📝 Admin Pages

### 1. Card Editor (`/admin/songs`)
**Best for: Detailed editing of individual songs**

- **Search**: Find songs quickly
- **Expand/Collapse**: Click song card to expand
- **Edit Mode**: Click "Edit" button
  - Edit title, artist, key
  - Add/remove sections
  - Edit chords and lyrics
  - Save or cancel changes
- **Delete**: Remove songs permanently

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
  "originalKey": "C",             // Required
  "defaultKey": "C",              // Required (usually same as originalKey)
  "songType": "Upbeat",           // "Upbeat" | "Slow" | "Moderate"
  "language": "English",          // "English" | "Tagalog"
  "worshipLeaders": [             // Array of leaders
    {
      "name": "LEADER_NAME",      // UPPERCASE
      "preferredKey": "D"         // Their preferred key
    }
  ],
  "sections": [                   // Chord sections
    {
      "id": "section_id",
      "name": "Verse 1",          // Section name
      "order": 1,                 // Order in song
      "chords": "C  G  Am  F",    // Chord progression
      "snippet": "First line...", // Lyrics snippet
      "notes": ""                 // Optional notes
    }
  ],
  "structure": ["Intro", "Verse 1", "Chorus"],
  "tags": [],
  "ccli": "",                     // CCLI license number
  "isActive": true,
  "externalUrl": null
}
```

### Important Fields:
- **songType**: Determines tempo icon (🔥 Upbeat, 💙 Slow, 💨 Moderate)
- **language**: Determines flag badge (🇬🇧 English, 🇵🇭 Tagalog)
- **worshipLeaders**: Names must match exactly across songs
- **sections**: Required for "Show Chords" button to work

## 💾 Saving Changes

### Important: Changes are stored in browser memory!

To persist changes:
1. Make your edits
2. Click **"Download"** button (green button in header)
3. Save the downloaded `songs-YYYY-MM-DD.json` file
4. Replace `data/songs.json` with the downloaded file
5. Commit and push to git
6. Vercel will auto-deploy

## 🔧 Changing the PIN

Edit `.env.local` file:
```
NEXT_PUBLIC_ADMIN_PIN=your_new_pin
```

Then restart the dev server.

## ⚠️ Important Notes

- **Auto-save**: Changes are stored in browser (localStorage)
- **Download JSON**: Always download after editing
- **Manual Update**: Replace `data/songs.json` manually
- **Session-based**: Stay logged in until you logout or close browser

## 📱 Mobile Usage

- Works great on mobile devices
- Large touch targets
- Responsive design
- Swipe-friendly cards

## 🚀 Workflow Options

### **Option 1: Edit Locally (Recommended)**

```
1. Open VS Code:
   cd D:\janversantos\Ignite\ignite-chords-app
   code data/songs.json

2. Make changes directly in JSON file

3. Verify JSON is valid:
   node -e "JSON.parse(require('fs').readFileSync('data/songs.json', 'utf8'))"

4. Test locally:
   npm run dev
   Visit http://localhost:3000/songs

5. Commit and push:
   git add data/songs.json
   git commit -m "Update songs: [describe changes]"
   git push origin main

6. Vercel auto-deploys in ~1-2 minutes
   Visit https://ignite-gray.vercel.app
```

### **Option 2: Edit via Admin Panel (For Single Songs)**

```
1. Login → https://ignite-gray.vercel.app/admin
2. Edit songs → /admin/songs or /admin/bulk
3. Download JSON → Click green "Download" button
4. Replace local file → Save to data/songs.json
5. Verify changes:
   npm run dev
   Check http://localhost:3000/songs
6. Deploy → git add, commit, push
7. Done! → Vercel auto-deploys in ~1-2 minutes
```

## 🎯 Tips

- **Card Editor**: Use for detailed chord/section editing
- **Bulk Editor**: Use for quick metadata updates
- **Search**: Works in both editors
- **Logout**: Always logout when done for security
- **Backup**: Download JSON regularly as backup

## 🔗 Quick Links

- Login: http://localhost:3000/admin
- Card Editor: http://localhost:3000/admin/songs
- Bulk Editor: http://localhost:3000/admin/bulk
- View Songs: http://localhost:3000/songs