# Supabase Setup Guide for Ignite Chords

This guide will help you set up Supabase for the Ignite Chords worship management system.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `ignite-chords`
   - Database Password: (generate a strong password and save it)
   - Region: Choose the closest to your location
5. Click "Create new project"

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the "SQL Editor"
2. Copy the contents of `lib/supabase-schema.sql`
3. Paste it into the SQL Editor and click "Run"

This will create all the necessary tables:
- `worship_leaders` - Store worship leader information
- `songs` - Store song details with keys and lyrics
- `chord_sections` - Store chord progressions for each song section
- `worship_leader_songs` - Map preferred keys for each leader
- `service_lineups` - Track service planning
- `lineup_songs` - Songs in each service
- `song_tags` - Categorize songs
- `song_tag_associations` - Link songs to categories

## Step 3: Configure Environment Variables

1. In your Supabase project dashboard, go to "Settings" > "API"
2. Copy the following values:
   - Project URL
   - `anon/public` key
   - `service_role/secret` key (for migration script)

3. Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SECRET_KEY=your_service_role_key_here

# Optional: For web scraping functionality
CLAUDE_API_KEY=your_claude_api_key_here
```

## Step 4: Set Up Row Level Security (RLS)

The schema automatically enables RLS and creates basic policies. For production, you may want to customize these policies based on your authentication needs.

Current policies allow all authenticated users full access. You can modify them in the Supabase dashboard under "Authentication" > "Policies".

## Step 5: Migrate Your Excel Data

1. Copy your `LINE UP - KEYS.xlsx` file to the project root directory
2. Install dependencies if not already done:
   ```bash
   npm install
   ```

3. Run the migration script:
   ```bash
   node scripts/migrate-excel-data.js
   ```

This will:
- Create worship leaders from your Excel sheets
- Import all songs with their keys
- Set up worship leader preferences
- Import chord progressions from the Chord Viewer sheet

## Step 6: Set Up Authentication (Optional)

If you want to add user authentication:

1. In Supabase dashboard, go to "Authentication" > "Settings"
2. Configure your authentication providers (Email, Google, etc.)
3. Set up email templates if using email authentication
4. Update your RLS policies to match your authentication requirements

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. Verify that:
   - Songs are loading on the dashboard
   - You can view song details
   - Chord transposition works
   - Search and filtering functions work

## Troubleshooting

### Common Issues:

1. **Migration fails with "permission denied"**
   - Make sure you're using the `service_role` key, not the `anon` key
   - Check that your environment variables are set correctly

2. **Songs not loading in the app**
   - Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check the browser console for errors
   - Verify RLS policies allow read access

3. **Excel file not found**
   - Make sure `LINE UP - KEYS.xlsx` is in the project root
   - Check the file path in the migration script

## Database Backup

To backup your data:

1. Go to Supabase dashboard > "Settings" > "Database"
2. Use the backup functionality
3. Or export data as CSV from each table

## Next Steps

After setup:
1. Customize the worship leader and category lists in your components
2. Add more songs through the web interface
3. Set up regular backups
4. Consider adding user authentication for multi-user access
5. Customize the UI to match your church's branding

## Support

If you encounter issues:
1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
3. Check the project's GitHub issues or create a new one