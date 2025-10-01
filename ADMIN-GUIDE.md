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

## 🚀 Workflow

```
1. Login → /admin
2. Edit songs → /admin/songs or /admin/bulk
3. Download JSON → Click green "Download" button
4. Replace file → Copy to data/songs.json
5. Deploy → git add, commit, push
6. Done! → Vercel auto-deploys in ~30 seconds
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