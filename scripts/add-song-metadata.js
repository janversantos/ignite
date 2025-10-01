const fs = require('fs');
const path = require('path');

// Read songs.json
const songsPath = path.join(__dirname, '../data/songs.json');
const data = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

// Tagalog song keywords
const tagalogKeywords = ['diyos', 'hesus', 'ka', 'ako', 'ng', 'salamat', 'buti', 'wala', 'ikaw', 'kay', 'labis', 'langit', 'galak', 'may', 'napaka', 'pupurihin', 'sukdulang', 'magpakailanman', 'kagalakan'];

// Function to detect if title is likely Tagalog
function isTagalog(title) {
  const titleLower = title.toLowerCase();
  return tagalogKeywords.some(keyword => titleLower.includes(keyword));
}

// Function to guess song type based on title/artist
function guessSongType(title, artist) {
  const titleLower = title.toLowerCase();
  const artistLower = (artist || '').toLowerCase();

  // Slow keywords
  if (titleLower.includes('savior') || titleLower.includes('grace') ||
      titleLower.includes('love') || titleLower.includes('amazing') ||
      titleLower.includes('beautiful') || titleLower.includes('healer') ||
      titleLower.includes('holy') || titleLower.includes('spirit') ||
      titleLower.includes('cornerstone') || artistLower.includes('hillsong')) {
    return 'Slow';
  }

  // Upbeat keywords
  if (titleLower.includes('celebrate') || titleLower.includes('joy') ||
      titleLower.includes('free') || titleLower.includes('alive') ||
      titleLower.includes('happy') || titleLower.includes('dance') ||
      titleLower.includes('shout') || titleLower.includes('praise') ||
      titleLower.includes('rooftops') || titleLower.includes('power')) {
    return 'Upbeat';
  }

  // Default to Moderate
  return 'Moderate';
}

// Update songs
let updated = 0;
data.songs.forEach(song => {
  let changed = false;

  // Add language if missing
  if (!song.language) {
    song.language = isTagalog(song.title) ? 'Tagalog' : 'English';
    changed = true;
  }

  // Add songType if missing
  if (!song.songType) {
    song.songType = guessSongType(song.title, song.artist);
    changed = true;
  }

  if (changed) updated++;
});

// Save updated JSON
data.lastUpdated = new Date().toISOString();
fs.writeFileSync(songsPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ Updated ${updated} songs with songType and language fields`);
console.log(`📊 Total songs: ${data.songs.length}`);
