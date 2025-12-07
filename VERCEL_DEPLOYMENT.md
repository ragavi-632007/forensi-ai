# Vercel Deployment Guide for ForensiAI

This guide will help you deploy your ForensiAI application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your Supabase project set up and configured
3. Your Gemini API key ready
4. Git repository (GitHub, GitLab, or Bitbucket) - recommended

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Your Code to Git

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub/GitLab/Bitbucket:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Step 2: Import Project to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect it's a Vite project

### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables

In the Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**How to add:**
1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase project URL (from Supabase dashboard → Settings → API)
   - **Environment:** Production, Preview, Development (select all)
3. Repeat for all three variables

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first deployment)
- Project name? (Press Enter for default or enter custom name)
- Directory? (Press Enter for current directory)
- Override settings? **No**

### Step 4: Add Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY
```

For each command, enter the value when prompted.

### Step 5: Deploy to Production

```bash
vercel --prod
```

## Environment Variables Reference

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → anon public key |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test authentication (login with your credentials)
- [ ] Test uploading a UFDR file
- [ ] Test AI chat functionality
- [ ] Check browser console for any errors
- [ ] Verify Supabase connection is working

## Custom Domain (Optional)

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**
- Check that all environment variables are added in Vercel dashboard
- Make sure variable names start with `VITE_` for Vite projects

### App Works Locally but Not on Vercel

1. **Check Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all variables are set for Production environment

2. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on the failed deployment
   - Check the build logs for specific errors

3. **Verify Supabase CORS:**
   - In Supabase Dashboard → Settings → API
   - Add your Vercel domain to allowed origins if needed

### API Errors After Deployment

1. **Supabase Connection:**
   - Verify `VITE_SUPABASE_URL` is correct
   - Check Supabase project is not paused
   - Verify RLS policies allow public access where needed

2. **Gemini API:**
   - Verify `VITE_GEMINI_API_KEY` is set correctly
   - Check API key is valid and not expired

## Continuous Deployment

Once connected to Git, Vercel will automatically:
- Deploy on every push to `main` branch (Production)
- Create preview deployments for pull requests
- Rebuild when you push changes

## Performance Tips

1. **Enable Edge Functions** (if needed for API routes)
2. **Optimize Images** - Vercel automatically optimizes images
3. **Enable Analytics** - Go to Settings → Analytics to track performance

## Security Notes

- ✅ Environment variables in Vercel are encrypted
- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's environment variables for all secrets
- ✅ Supabase anon key is safe for client-side use (RLS protects data)

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Project Issues: Check your repository's issue tracker

---

**Your app is now live! 🚀**

Visit your deployment URL to start using ForensiAI in production.

