# Quick Vercel Deployment Checklist

## Before Deploying

- [ ] All code is committed to Git
- [ ] `.env` file is NOT committed (check `.gitignore`)
- [ ] You have your Supabase credentials ready
- [ ] You have your Gemini API key ready

## Environment Variables Needed

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-key-here
```

## Quick Deploy Steps

### Option 1: Via Vercel Dashboard (Easiest)
1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Click Deploy

### Option 2: Via CLI
```bash
npm i -g vercel
vercel login
vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY
vercel --prod
```

## After Deployment

- [ ] Test the app loads
- [ ] Test login functionality
- [ ] Test file upload
- [ ] Test AI chat
- [ ] Check browser console for errors

## Common Issues

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json

**Environment variables not working?**
- Make sure they start with `VITE_`
- Redeploy after adding variables

**Supabase connection fails?**
- Verify URL and key are correct
- Check Supabase project is active

---

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

