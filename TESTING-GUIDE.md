# Testing Guide - Nashville Number System & Chord Import

## 🎵 Overview
This application now supports:
1. **Chord Import** from Ultimate Guitar URLs or manual input
2. **Nashville Number System** automatic conversion
3. **Enhanced Song Management** with new category fields

## 🗄️ Database Setup Required

First, run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to songs table
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS song_type VARCHAR(20) DEFAULT 'Slow',
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS tempo INTEGER,
ADD COLUMN IF NOT EXISTS time_signature VARCHAR(10),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS on chord_sections (table should already exist)
ALTER TABLE chord_sections ENABLE ROW LEVEL SECURITY;
```

## 🧪 Testing Scenarios

### 1. **Nashville Number System Conversion**

**Test Data Examples:**

**Give Me Jesus Style (in D major):**
```
1 2 3 4 5 6
Expected Result: D Em F#m G A Bm
```

**Roman Numerals (in G major):**
```
I - IV - V - vi
Expected Result: G - C - D - Em
```

**Complex Progression (in C major):**
```
1 - 6m - 4 - 5
Expected Result: C - Am - F - G
```

### 2. **Manual Chord Import Testing**

**Steps:**
1. Go to any song in the Songs page
2. Click "Edit" (pencil icon)
3. Scroll down and click "Import Chords" button
4. Select "Paste Chords" tab
5. Paste test content below:

**Test Content (Nashville Numbers):**
```
[Verse 1]
1 - 4 - 5 - 1
Amazing grace how sweet the sound

[Chorus]
1 - 6m - 4 - 5
That saved a wretch like me

[Bridge]
I - IV - V - vi
```

**Expected Behavior:**
- Nashville numbers should auto-convert to actual chords based on song key
- Sections should be parsed automatically
- You should see "[#] Convert Numbers to Chords" button if numbers detected

### 3. **URL Import Testing**

**Test URL:**
```
https://tabs.ultimate-guitar.com/tab/gateway-worship/alabaster-jar-chords-764319
```

**Steps:**
1. Edit any song
2. Click "Import Chords"
3. Paste the URL above
4. Click "Import"

**Expected Results:**
- Should extract chord content from Ultimate Guitar
- Should create multiple sections automatically

### 4. **Existing Song Testing**

If you have a song called "Give Me Jesus" with number notation:

**Steps:**
1. Edit the song
2. Look for orange "[#] Convert Numbers to Chords" button in chord sections
3. Click it to convert numbers to actual chord names

## 📋 Test Checklist

- [ ] Database migration completed successfully
- [ ] Homepage loads (http://localhost:3006)
- [ ] Songs page loads (http://localhost:3006/songs)
- [ ] Can edit existing songs without errors
- [ ] Nashville number detection works (orange button appears)
- [ ] Number to chord conversion works correctly
- [ ] Manual chord import creates sections properly
- [ ] URL import works (may fail due to JavaScript rendering)
- [ ] Song saving works without "Error updating sections"
- [ ] New category fields (song_type, language) save correctly

## 🔧 Key Features

**Nashville Number System:**
- Supports: 1-7, I-VII, i-vii
- Modifiers: m, 7, sus, etc.
- Bass notes: 1/3, IV/vi, etc.
- Auto-detection and conversion

**Chord Import:**
- URL import from Ultimate Guitar
- Manual paste with section parsing
- Automatic section detection ([Verse], [Chorus], etc.)
- Nashville number auto-conversion during import

**Enhanced Categories:**
- Song Type: Slow/Medium/Fast
- Language: English/Tagalog/Mixed
- Category: Worship/Praise/Contemporary/Traditional
- Additional fields: Tempo, Time Signature, Notes

## 🎯 Success Criteria

✅ All HTTP requests return 200
✅ No console errors during normal usage
✅ Nashville numbers convert correctly
✅ Chord sections save to database
✅ Import functionality works as expected
✅ Category system functions properly