const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('temp-songs.json', 'utf8'));

// Group songs by title and collect worship leader preferences
const songMap = new Map();
raw.forEach(row => {
  const title = row.Song;
  const key = row.Key || 'C';
  const leader = row['Worship Leader'];

  if (!songMap.has(title)) {
    songMap.set(title, {
      title,
      originalKey: key,
      defaultKey: key,
      worshipLeaders: []
    });
  }

  if (leader && key) {
    const song = songMap.get(title);
    // Avoid duplicates
    const existing = song.worshipLeaders.find(wl => wl.name === leader && wl.preferredKey === key);
    if (!existing) {
      song.worshipLeaders.push({
        name: leader,
        preferredKey: key
      });
    }
  }
});

// Convert to array and add IDs
const songs = Array.from(songMap.values()).map((song, idx) => ({
  id: String(idx + 1),
  ...song,
  artist: '',
  ccli: '',
  isActive: true,
  externalUrl: null,
  tags: [],
  structure: [],
  sections: []
}));

// Extract unique worship leaders
const leaderSet = new Set();
raw.forEach(row => {
  if (row['Worship Leader']) leaderSet.add(row['Worship Leader']);
});

const worshipLeaders = Array.from(leaderSet).sort().map((name, idx) => ({
  id: String(idx + 1),
  name: name,
  displayName: name,
  email: null,
  phone: null,
  isActive: true
}));

const output = {
  songs,
  worshipLeaders,
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync('data/songs.json', JSON.stringify(output, null, 2));
console.log(`Generated songs.json with ${songs.length} songs and ${worshipLeaders.length} worship leaders`);