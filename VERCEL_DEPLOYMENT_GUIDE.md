# Vercel Deployment Guide

## Current Issue: 404 NOT_FOUND

The deployment builds successfully but returns 404 errors because Vercel needs to know the Next.js app is in the `frontend` subdirectory.

---

## Solution 1: Update vercel.json (Already Done)

The `vercel.json` has been updated to use Vercel v2 configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

This tells Vercel:
- Build the Next.js app from `frontend/package.json`
- Route all requests to the frontend directory

---

## Solution 2: Configure Root Directory in Vercel Dashboard (Recommended)

If the vercel.json approach doesn't work, configure it in the Vercel dashboard:

### Steps:

1. **Go to your Vercel project settings:**
   - Visit https://vercel.com/christopherdominics-projects/drips-maintener
   - Click "Settings"

2. **Update Build & Development Settings:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `.next` (or leave default)
   - **Install Command:** `npm install` (or leave default)

3. **Save and Redeploy:**
   - Click "Save"
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

---

## Solution 3: Alternative vercel.json (If needed)

If the above doesn't work, try this simpler configuration:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "outputDirectory": "frontend/.next"
}
```

---

## Verification Steps

After deployment, test these URLs:

1. **Home Page:** https://your-app.vercel.app/
2. **Dashboard:** https://your-app.vercel.app/dashboard
3. **Groups:** https://your-app.vercel.app/groups
4. **Profile:** https://your-app.vercel.app/profile

All should load without 404 errors.

---

## Environment Variables

Make sure these are set in Vercel project settings:

```
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=CBTSP7WGCOKCXMYJA64GMCWTVHKOMYYILBWOPKPVEWPJICRQLNA3A5H7
```

To add them:
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Redeploy

---

## Troubleshooting

### Issue: Still getting 404

**Check:**
1. Verify Root Directory is set to `frontend` in Vercel settings
2. Check build logs for errors
3. Ensure `.next` directory is being created
4. Verify routes in vercel.json are correct

**Try:**
- Delete the vercel.json and rely on dashboard settings only
- Or use the dashboard Root Directory setting instead of vercel.json

### Issue: Build succeeds but pages don't load

**Possible causes:**
1. Output directory mismatch
2. Missing environment variables
3. Static generation issues

**Solutions:**
1. Check Vercel build logs for warnings
2. Verify all environment variables are set
3. Check that `dynamic = 'force-dynamic'` is set on problematic pages

### Issue: Some pages work, others don't

**Check:**
1. Localized routes (e.g., `/en/dashboard` vs `/dashboard`)
2. Dynamic routes (e.g., `/groups/[id]`)
3. API routes if any

**Solution:**
- Ensure next-intl middleware is configured correctly
- Check that all dynamic routes have proper fallbacks

---

## Recommended Approach

**Best practice for monorepo Next.js on Vercel:**

1. **Use Vercel Dashboard Settings** (Easiest)
   - Set Root Directory to `frontend`
   - Let Vercel auto-detect Next.js
   - No vercel.json needed

2. **Or use vercel.json** (Current approach)
   - Keep the v2 configuration
   - Explicitly define builds and routes
   - More control but more complex

---

## Current Status

- ✅ Build succeeds
- ✅ Frontend compiles without errors
- ⚠️ Getting 404 on deployed URL
- 🔄 Waiting for configuration fix to take effect

---

## Next Steps

1. Wait for the latest deployment to complete (commit `294b000`)
2. If still 404, configure Root Directory in Vercel dashboard
3. Redeploy after configuration change
4. Test all routes

---

## Alternative: Deploy Frontend as Separate Project

If monorepo deployment continues to have issues:

1. Create a new Vercel project
2. Import only the `frontend` directory
3. Set it as a standalone Next.js project
4. This avoids monorepo complexity

---

**Last Updated:** March 13, 2026  
**Current Commit:** `294b000`  
**Status:** Awaiting deployment with updated vercel.json
