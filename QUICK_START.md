# Quick Start Guide

## ✅ Setup Complete!

Your ForensiAI application is now configured with Supabase integration.

## 🚀 Running the Application

The development server should be running on: **http://localhost:3000**

If it's not running, start it with:
```bash
npm run dev
```

## 🔑 Environment Variables

Make sure you have a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy the Project URL and anon/public key

## 🔐 Test Login Credentials

Use these credentials to test the application:
- **Badge ID:** `miller.j`
- **Secure Token:** `demo123`

Or use the demo mode:
- **Badge ID:** (any value)
- **Secure Token:** `demo`

## 📊 What's Stored in Supabase

✅ AI Chat History - All conversations with the AI assistant  
✅ Case Files - Complete case data (calls, messages, locations, media)  
✅ AI Insights - Generated reports and analysis  
✅ Authentication - Officer accounts  
✅ Activity Logs - Audit trail of all actions  

## 🐛 Troubleshooting

### Application won't start
- Check that Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check for port conflicts (default port is 3000)

### Supabase connection issues
- Verify your `.env` file has the correct Supabase URL and key
- Check that all tables exist in your Supabase project
- Look at the browser console for specific error messages

### Authentication fails
- Make sure the `officers` table has data
- Check that badge_id and secure_token match exactly (case-sensitive)
- Try the demo mode with token: `demo`

### Data not saving
- Check browser console for errors
- Verify Supabase project is active (not paused)
- Ensure RLS policies are set correctly

## 📝 Next Steps

1. **Configure Supabase** - Add your credentials to `.env`
2. **Test Login** - Use the test credentials above
3. **Upload a Case** - Try uploading a case file
4. **Test AI Chat** - Send messages in the AI chat
5. **Generate Report** - Create an AI-generated case report

All data will be automatically saved to Supabase!

