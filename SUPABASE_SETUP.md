# Supabase Setup Guide for ForensiAI

This guide will help you set up Supabase to store all your ForensiAI data including:
- AI chat history
- Case files
- AI insights/reports
- Authentication data

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `forensiai` (or your preferred name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region to your users
5. Click "Create new project" and wait for it to be ready (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 3: Set Up Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Or if using Vite:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit your `.env` file to version control! Add it to `.gitignore`.

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase_schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this means the tables were created successfully

## Step 5: Create a Test Officer Account

The schema includes a sample officer, but you can create more:

1. Go to **Table Editor** → **officers**
2. Click "Insert row"
3. Fill in:
   - `badge_id`: e.g., `miller.j`
   - `secure_token`: e.g., `demo123` (use a strong password in production!)
   - `name`: e.g., `Det. Miller`
   - `role`: e.g., `Investigator`
4. Click "Save"

## Step 6: Verify Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Try logging in with the officer credentials you created
4. Upload a case file
5. Send a message in the AI chat
6. Generate an AI report

## Step 7: Check Your Data in Supabase

You can verify that data is being stored:

1. **Cases**: Go to **Table Editor** → **cases** - you should see your uploaded cases
2. **AI Chat**: Go to **Table Editor** → **ai_chat_logs** - you should see chat messages
3. **AI Insights**: Go to **Table Editor** → **ai_insights** - you should see generated reports
4. **Activity Logs**: Go to **Table Editor** → **activity_logs** - you should see user activities

## Troubleshooting

### "Supabase not configured" warnings
- Check that your `.env` file has the correct variable names
- Make sure you've restarted your dev server after adding environment variables
- Verify the values are correct (no extra spaces, quotes, etc.)

### Authentication fails
- Check that the `officers` table has data
- Verify `badge_id` and `secure_token` match exactly (case-sensitive)
- Check the browser console for specific error messages

### Data not saving
- Check the browser console for error messages
- Verify your Supabase project is active (not paused)
- Check Row Level Security (RLS) policies - the schema includes permissive policies for development
- Verify the table structure matches the schema

### Database connection errors
- Check your internet connection
- Verify your Supabase project URL is correct
- Make sure your Supabase project is not paused (free tier projects pause after inactivity)

## Security Notes

⚠️ **Important for Production:**

1. **Row Level Security (RLS)**: The schema includes permissive policies for development. For production, you should:
   - Create proper RLS policies based on user roles
   - Use Supabase Auth for proper user authentication
   - Implement proper access controls

2. **API Keys**: Never expose your service role key in client-side code. Only use the anon key.

3. **Officer Tokens**: In production, use proper password hashing (bcrypt, etc.) instead of plain text tokens.

4. **Environment Variables**: Use secure methods to manage environment variables in production (e.g., Vercel, Netlify, or your hosting platform's environment variable system).

## What Gets Stored in Supabase

✅ **AI Chat History** - All conversations with the AI assistant  
✅ **Case Files** - Complete case data including calls, messages, locations, and media  
✅ **AI Insights** - Generated reports and analysis  
✅ **Authentication** - Officer accounts and sessions  
✅ **Activity Logs** - Audit trail of all user actions  
✅ **Team Messages** - Collaboration chat messages  

All data is automatically saved when you interact with the application!

