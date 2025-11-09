# Quick Deploy to Vercel - LifeCompass

## ✅ Your Project is Already Deployed!

**Project Name:** lifecompass  
**Organization:** buffr  
**Latest Deployment:** https://lifecompass-877arib9q-buffr.vercel.app

## Step 1: Add Custom Domain (theshandi.com)

### In Vercel Dashboard:

1. Go to: https://vercel.com/buffr/lifecompass/settings/domains
2. Click **"Add Domain"**
3. Enter: **theshandi.com**
4. Click **"Add"**
5. Vercel will show you DNS records to configure

## Step 2: Configure Namecheap DNS

### Go to Namecheap Dashboard:

1. Navigate to: **Domain List → theshandi.com → Advanced DNS**
2. You'll see your current TXT record (keep it if needed)

### Add These Records:

**Remove any existing A records first**, then add:

#### Record 1: Root Domain (theshandi.com)

```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

#### Record 2: WWW Subdomain

```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### Important Notes:

- **Vercel may provide different IP addresses** - Always use the exact values shown in your Vercel dashboard
- Current Vercel A record IP: `76.76.21.21` (may vary)
- Keep your existing TXT record for Google verification if needed

## Step 3: Verify Domain

1. **Wait 5-60 minutes** for DNS propagation
2. Check Vercel dashboard - status should show **"Valid Configuration"**
3. Vercel will automatically provision SSL certificate
4. Your site will be live at: **https://theshandi.com**

## Step 4: Test Your Deployment

1. **Visit your Vercel URL**: https://lifecompass-877arib9q-buffr.vercel.app
2. **After DNS propagates**: Visit https://theshandi.com
3. **Test HTTPS**: Should work automatically

## Environment Variables

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

```
DATABASE_URL=your-neon-postgres-url
NEO4J_URI=your-neo4j-uri
NEO4J_USERNAME=your-neo4j-username
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
EMBEDDING_API_KEY=your-embedding-key
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
```

## Quick Commands

```bash
# View deployments
vercel ls

# Deploy to production
vercel --prod

# View project info
vercel project ls

# View domains
vercel domains ls
```

## Troubleshooting

### Build Errors?

- Check Vercel build logs in dashboard
- Ensure all environment variables are set
- Verify `package.json` has correct build script

### Domain Not Working?

- Verify DNS records match Vercel's requirements exactly
- Wait up to 48 hours for full DNS propagation
- Check DNS propagation: https://dnschecker.org/#A/theshandi.com

### SSL Issues?

- Vercel handles SSL automatically
- Takes ~5 minutes after DNS is valid
- Check domain status in Vercel dashboard
