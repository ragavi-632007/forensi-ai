# How to Fix the Gemini API Key Error

## The Error
You're seeing: **"API key not valid. Please pass a valid API key."**

This means the Gemini API key is either missing or invalid.

## Quick Fix Steps

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the generated API key (it will look like: `AIzaSy...`)

### 2. Add the API Key to Your .env File

1. Open the `.env` file in your project root
2. Add or update this line:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   Replace `your_actual_api_key_here` with the key you copied.

3. Your `.env` file should look like this:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Gemini API Key
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```

### 3. Restart the Development Server

**Important:** After updating the `.env` file, you MUST restart the dev server:

1. Stop the current server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### 4. Verify It Works

1. Open the app in your browser
2. Try using the AI chat feature
3. The error should be gone!

## Troubleshooting

### Still getting the error?

1. **Check the .env file location**
   - Make sure `.env` is in the project root (same folder as `package.json`)
   - Not in a subfolder

2. **Check the variable name**
   - Must be exactly: `GEMINI_API_KEY` (case-sensitive)
   - No spaces around the `=`

3. **Restart the server**
   - Environment variables are only loaded when the server starts
   - Always restart after changing `.env`

4. **Check the API key**
   - Make sure you copied the entire key
   - No extra spaces or quotes
   - The key should start with `AIzaSy`

5. **Verify the key is valid**
   - Go back to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Make sure the key is active and not revoked

## Alternative: Use VITE_ Prefix

If you prefer, you can also use:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Both `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY` will work.

## Security Note

⚠️ **Never commit your `.env` file to Git!**

Make sure `.env` is in your `.gitignore` file to keep your API keys safe.

