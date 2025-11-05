# Namecheap DNS Configuration for Vercel (theshandi.com)

## Step-by-Step Instructions

### Step 1: Deploy to Vercel First

1. **Deploy your project** (if not already deployed):
   ```bash
   cd lifecompass-next
   vercel --prod
   ```

2. **Note your Vercel deployment URL** (e.g., `lifecompass-xxx.vercel.app`)

### Step 2: Add Domain in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **LifeCompass** project
3. Go to **Settings → Domains**
4. Click **"Add Domain"**
5. Enter: **theshandi.com**
6. Click **"Add"**

### Step 3: Configure Namecheap DNS Records

Vercel will show you the DNS records to add. Here's what you need:

#### In Namecheap Dashboard:

1. Go to: **Domain List → theshandi.com → Advanced DNS**
2. **Remove any conflicting records** (if you have existing A records pointing elsewhere)

#### Add These Records:

**For Root Domain (theshandi.com):**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic (or 30 min)
```

**For www Subdomain (www.theshandi.com):**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic (or 30 min)
```

**Note:** Vercel may provide different IP addresses. **Always use the values shown in your Vercel dashboard** as they may change.

### Step 4: Verify Domain in Vercel

1. Go back to **Vercel Dashboard → Settings → Domains**
2. Wait for status to show **"Valid Configuration"** (can take 5-60 minutes)
3. Vercel will automatically:
   - Provision SSL certificate (HTTPS)
   - Configure DNS
   - Set up redirects

### Step 5: Current Namecheap DNS Records to Remove/Update

Based on your current Namecheap setup, you have:
- **TXT Record** for Google site verification (keep this if you need it)

**Actions:**
1. **Keep** the TXT record for Google verification (if needed)
2. **Remove** any existing A records pointing to other IPs
3. **Add** the A record for root domain (@) → `76.76.21.21`
4. **Add** the CNAME record for www → `cname.vercel-dns.com`

### Step 6: DNS Propagation Check

After adding records:
- **Wait 15-60 minutes** for DNS to propagate
- Check status: [dnschecker.org](https://dnschecker.org/#A/theshandi.com)
- Verify: `nslookup theshandi.com` in terminal

### Step 7: Final Configuration

Once DNS propagates:
1. Vercel will automatically detect the domain
2. SSL certificate will be provisioned (takes ~5 minutes)
3. Your site will be live at: **https://theshandi.com**

## Troubleshooting

### Domain Not Connecting?

1. **Check DNS records** are exactly as shown in Vercel dashboard
2. **Wait longer** - DNS can take up to 48 hours (usually 15-60 min)
3. **Clear DNS cache**: 
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Or use Google DNS: 8.8.8.8
   ```

### Vercel Shows "Invalid Configuration"?

1. Verify A record value matches Vercel's IP (currently `76.76.21.21`)
2. Ensure CNAME for www points to `cname.vercel-dns.com`
3. Remove any conflicting A or CNAME records
4. Wait 15-30 minutes and check again

### SSL Certificate Issues?

- Vercel handles SSL automatically via Let's Encrypt
- Takes ~5 minutes after DNS is valid
- If issues persist, contact Vercel support

## Quick Reference: Namecheap DNS Records

After setup, your Namecheap DNS should have:

```
Record Type | Host | Value                    | TTL
------------|------|--------------------------|------
A           | @    | 76.76.21.21              | Auto
CNAME       | www  | cname.vercel-dns.com     | Auto
TXT         | @    | (keep existing if needed)| Auto
```

**Important:** Always use the exact values provided by Vercel in your dashboard, as they may differ.

## Next Steps After Domain is Live

1. **Test HTTPS**: Visit https://theshandi.com
2. **Test www redirect**: Visit https://www.theshandi.com (should redirect to non-www)
3. **Monitor deployments**: All future deployments will update your live site
4. **Set up automatic deployments**: Connect GitHub repo for auto-deploy

