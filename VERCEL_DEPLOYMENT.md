# Vercel Deployment Guide for LifeCompass

## Step 1: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):

```bash
npm i -g vercel
```

2. **Login to Vercel**:

```bash
vercel login
```

3. **Deploy from project directory**:

```bash
cd lifecompass-next
vercel
```

4. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No** (for first deployment)
   - Project name: **lifecompass** (or your preferred name)
   - Directory: **./** (current directory)
   - Override settings? **No**

5. **For production deployment**:

```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `lifecompass`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

## Step 2: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

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
GRAPH_API_URL=http://localhost:8058 (if using backend)
```

## Step 3: Configure Namecheap DNS for theshandi.com

### In Vercel Dashboard:

1. Go to **Your Project → Settings → Domains**
2. Click **"Add Domain"**
3. Enter: **theshandi.com**
4. Vercel will show you DNS records to add

### In Namecheap Dashboard:

1. Go to **Domain List → theshandi.com → Advanced DNS**
2. **Remove existing A records** (if any) pointing to other IPs
3. **Add these records** (Vercel will provide exact values):

#### For Root Domain (theshandi.com):

```
Type: A
Host: @
Value: 76.76.21.21 (or IP provided by Vercel)
TTL: Automatic (or 30 min)
```

#### For www Subdomain:

```
Type: CNAME
Host: www
Value: cname.vercel-dns.com (or value provided by Vercel)
TTL: Automatic (or 30 min)
```

#### For SSL (Vercel will handle this automatically):

- Vercel automatically provisions SSL certificates via Let's Encrypt
- No manual SSL configuration needed

### DNS Propagation:

- DNS changes can take **24-48 hours** to propagate globally
- Usually works within **15 minutes to 2 hours**
- Check propagation: [dnschecker.org](https://dnschecker.org)

## Step 4: Verify Domain Configuration

1. **In Vercel**: Wait for domain status to show "Valid Configuration"
2. **Check DNS**: Run `nslookup theshandi.com` or use online DNS checker
3. **Test SSL**: Vercel automatically provisions SSL (HTTPS)

## Step 5: Update Next.js Config (if needed)

If you need to configure redirects or rewrites, update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect www to non-www (optional)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.theshandi.com",
          },
        ],
        destination: "https://theshandi.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

## Troubleshooting

### Domain not connecting?

1. Verify DNS records are correct in Namecheap
2. Wait for DNS propagation (can take up to 48 hours)
3. Check Vercel domain status page
4. Ensure no conflicting records exist

### Build errors?

1. Check environment variables are set
2. Verify `package.json` has correct build script
3. Check Vercel build logs for errors

### SSL certificate issues?

- Vercel handles SSL automatically
- If issues persist, contact Vercel support

## Quick Deploy Command

```bash
# One-time setup
cd lifecompass-next
vercel login
vercel

# Production deployment
vercel --prod

# View deployment URL
vercel ls
```

## Post-Deployment

1. **Test the live site**: Visit https://theshandi.com
2. **Monitor deployments**: Check Vercel dashboard
3. **Set up automatic deployments**: Push to GitHub → Auto-deploy on Vercel
4. **Configure custom domain**: Follow Step 3 above
