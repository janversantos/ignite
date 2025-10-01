# Ignite Chords - Worship Songs Management System

A modern, user-friendly web application for managing worship songs, keys, chord progressions, and worship leader assignments for church teams.

## 🎵 Features

### Core Functionality
- **Song Library Management** - Organize your complete song database
- **Key Transposition** - Automatically transpose chords to any key
- **Worship Leader Assignments** - Track which leaders play which songs and their preferred keys
- **Interactive Dashboard** - Easy-to-navigate interface with search and filtering
- **Chord Progression Display** - View and edit chord progressions with lyrics

### Advanced Features
- **Web Scraping Integration** - Import songs from chord websites
- **Excel Data Migration** - Import your existing Excel worship data
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Search** - Instantly find songs by title, leader, or key
- **Export Functionality** - Export your data to CSV format

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier available)
- Your existing Excel file with worship songs data

### Installation

1. **Clone or download the project**
   ```bash
   cd ignite-chords-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase database**
   - Follow the detailed instructions in `SUPABASE_SETUP.md`
   - Create your Supabase project
   - Run the database schema
   - Configure environment variables

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials

5. **Migrate your Excel data** (optional)
   ```bash
   # Place your Excel file in the root directory
   node scripts/migrate-excel-data.js
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ignite-chords-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard
│   ├── songs/             # Song management pages
│   ├── api/               # API routes
│   └── layout.tsx         # App layout
├── components/            # React components
│   ├── SongDashboard.tsx  # Main dashboard component
│   ├── SongDetailView.tsx # Individual song view
│   ├── ChordTransposer.tsx # Key transposition tool
│   └── ...                # Other UI components
├── lib/                   # Database and utilities
│   ├── supabase.ts        # Supabase client config
│   └── supabase-schema.sql # Database schema
├── utils/                 # Utility functions
│   ├── chordTransposer.ts # Chord transposition logic
│   ├── webScraper.ts      # Web scraping utilities
│   └── excelParser.ts     # Excel data parsing
├── types/                 # TypeScript type definitions
├── scripts/               # Migration and setup scripts
└── ...
```

## 🎼 Using the Application

### Dashboard
- View all songs in table or grid format
- Search by song title, worship leader, or category
- Filter by worship leader or song category
- Quick access to chord transposer tool

### Song Management
- Add new songs manually or import from web
- Edit existing songs and chord progressions
- Delete songs (with bulk selection)
- Export song data to CSV

### Song Details
- View complete song information
- Transpose chords to any key in real-time
- Edit lyrics and chord progressions
- Copy chord progressions to clipboard

### Chord Transposer
- Standalone tool for quick chord transposition
- Supports all major and minor keys
- Real-time preview of transposed chords
- Quick examples for common progressions

## 🗄️ Database Schema

The application uses the following main entities:

- **Songs** - Title, keys, lyrics, chord progressions
- **Worship Leaders** - Leader information and preferences
- **Chord Sections** - Verse, chorus, bridge progressions
- **Worship Leader Songs** - Preferred keys for each leader
- **Service Lineups** - Planning future services (optional)

## 🌐 Web Scraping

The application can import songs from chord websites:

1. Search by song title and artist
2. Import from direct URLs
3. Automatically extract chords and lyrics
4. Parse chord progressions into structured format

**Supported sites include:**
- Ultimate Guitar
- Chordie
- Chordify
- And other chord websites

## 🎯 Key Features Explained

### Chord Transposition
- Supports all 12 musical keys
- Handles sharps and flats correctly
- Maintains chord quality (major, minor, diminished, etc.)
- Real-time preview of changes

### Worship Leader Management
- Each leader has preferred keys for songs
- Track how often songs are played
- View leader-specific song lists
- Easy assignment of new songs

### Search & Filtering
- Full-text search across song titles
- Filter by worship leader
- Filter by category (Contemporary, Traditional, etc.)
- Sort by title, date, or popularity

## 🔧 Customization

### Adding New Categories
Edit the categories array in `components/SongManagement.tsx`:
```typescript
const categories = ['Worship', 'Praise', 'Contemporary', 'Traditional', 'Filipino', 'English']
```

### Adding New Worship Leaders
Leaders can be added through the UI or by editing the database directly.

### Styling
The application uses Tailwind CSS. Customize colors in `tailwind.config.ts`.

## 📊 Data Import/Export

### Excel Import
- Supports the existing Excel format with multiple sheets
- Imports worship leaders, songs, and preferences
- Handles chord progressions from "Chord Viewer" sheet

### CSV Export
- Export all songs with metadata
- Includes title, key, worship leader, category, usage stats
- Compatible with Excel and Google Sheets

## 🔒 Security

- Uses Supabase Row Level Security (RLS)
- Environment variables for sensitive data
- Input validation on all forms
- Secure API endpoints

## 🚦 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Create React components in `components/`
2. Add new pages in `app/`
3. Update types in `types/`
4. Add database changes to schema
5. Update documentation

## 🐛 Troubleshooting

### Common Issues

**Songs not loading:**
- Check Supabase environment variables
- Verify database connection
- Check browser console for errors

**Migration script fails:**
- Ensure Excel file is in correct location
- Verify Supabase secret key is set
- Check file permissions

**Chord transposition not working:**
- Verify chord format (C, Dm, F#, etc.)
- Check for special characters in chords
- Review transposition logic

### Getting Help
1. Check the `SUPABASE_SETUP.md` guide
2. Review error messages in browser console
3. Verify all environment variables are set
4. Check Supabase dashboard for database issues

## 🤝 Contributing

This project was built specifically for church worship teams. Feel free to:
- Report bugs or request features
- Improve the documentation
- Add new chord sites for scraping
- Enhance the UI/UX

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js, React, and TypeScript
- Database powered by Supabase
- Styling with Tailwind CSS
- Icons from Lucide React
- Excel parsing with SheetJS

---

**For your church worship team** 🎵