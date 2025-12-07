# Supabase Storage Setup for Evidence Media

## Quick Setup

To fix the image upload error, you need to create a Supabase Storage bucket for evidence media.

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to **Storage** in the left sidebar

2. **Create a New Bucket**
   - Click **"New bucket"**
   - Name: `evidence-media`
   - **Public bucket**: ✅ Check this (so images can be accessed via public URLs)
   - Click **"Create bucket"**

3. **Set Bucket Policies** (if needed)
   - Go to **Storage** → **Policies** → `evidence-media`
   - Make sure there's a policy allowing uploads and reads
   - Or use the SQL below to set up policies

### SQL to Create Bucket and Policies

Run this in your Supabase SQL Editor:

```sql
-- Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-media', 'evidence-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence-media');

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'evidence-media');

-- Allow authenticated users to update/delete their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'evidence-media');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence-media');
```

### Alternative: Use Local Storage Only

If you don't want to set up Supabase Storage, the app will work but images won't persist after page reload. They'll only work in the current session.

