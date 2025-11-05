# Complete Domain Setup Guide: theshandi.com → Vercel

## ✅ Current Status

**Vercel Project:** lifecompass  
**Production URL:** https://lifecompass-buffr.vercel.app  
**Organization:** buffr  
**Status:** ✅ Deployed and Live

---

## Step 1: Add Domain in Vercel Dashboard

### Action Steps:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/buffr/lifecompass/settings/domains
   - Or: Dashboard → lifecompass → Settings → Domains

2. **Add Domain:**
   - Click **"Add Domain"** button
   - Enter: `theshandi.com`
   - Click **"Add"**

3. **Vercel will show you DNS records:**
   - Note the **A record IP address** (usually `76.76.21.21`)
   - Note the **CNAME value** for www (usually `cname.vercel-dns.com`)

---

## Step 2: Configure Namecheap DNS Records

### Go to Namecheap:

1. **Login to Namecheap**
2. **Navigate to:**
   - Domain List → **theshandi.com** → **Advanced DNS** tab

### Current Records (Keep These):
- ✅ **TXT Record** for Google verification (keep if needed)

### Remove These (If They Exist):
- ❌ Any **A records** pointing to other IPs
- ❌ Any **CNAME records** for www pointing elsewhere

### Add These Records:

#### Record 1: Root Domain (@)
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic (or 30 min)
```

Click **"Add New Record"** → Select **A Record** → Fill in:
- Host: `@` (or leave blank, both work)
- Value: `76.76.21.21` (use the IP Vercel shows you)
- TTL: Automatic

#### Record 2: WWW Subdomain
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic (or 30 min)
```

Click **"Add New Record"** → Select **CNAME Record** → Fill in:
- Host: `www`
- Value: `cname.vercel-dns.com` (use the value Vercel shows you)
- TTL: Automatic

### Your Final DNS Configuration Should Look Like:

```
Type    | Host | Value                    | TTL
--------|------|--------------------------|------
A       | @    | 76.76.21.21              | Auto
CNAME   | www  | cname.vercel-dns.com     | Auto
TXT     | @    | (your existing record)   | Auto
```

---

## Step 3: Verify Domain Configuration

### In Vercel Dashboard:

1. Go back to: **Settings → Domains**
2. Wait for status to change:
   - ⏳ **"Invalid Configuration"** → Checking DNS
   - ✅ **"Valid Configuration"** → Ready!
   - 🔒 **SSL Certificate** → Provisioning (automatic)

### Timeline:
- **DNS Propagation:** 15 minutes to 2 hours (usually 15-30 min)
- **SSL Certificate:** 5 minutes after DNS is valid
- **Full Activation:** Usually within 1 hour

---

## Step 4: Test Your Domain

### Check DNS Propagation:

1. **Online Checker:**
   - Visit: https://dnschecker.org/#A/theshandi.com
   - Should show `76.76.21.21` globally

2. **Terminal Check:**
   ```bash
   nslookup theshandi.com
   # Should return: 76.76.21.21
   ```

3. **Visit Your Site:**
   - https://theshandi.com (should work)
   - https://www.theshandi.com (should redirect to non-www)

---

## Step 5: Environment Variables (Important!)

Make sure these are configured in **Vercel Dashboard → Settings → Environment Variables**:

### Required Variables:
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

### How to Add:
1. Go to: **Settings → Environment Variables**
2. Click **"Add"** for each variable
3. Add for **Production**, **Preview**, and **Development**
4. Click **"Save"**
5. Redeploy if needed: `vercel --prod`

---

## Troubleshooting

### ❌ Domain Shows "Invalid Configuration"

**Check:**
1. DNS records match Vercel exactly (IP and CNAME)
2. Removed conflicting A/CNAME records
3. Wait 15-30 minutes for propagation
4. Use DNS checker to verify: https://dnschecker.org

**Fix:**
- Double-check IP address in Vercel dashboard
- Ensure @ record points to Vercel's IP
- Remove any conflicting records

### ❌ SSL Certificate Not Working

**Vercel handles this automatically:**
- Wait 5-10 minutes after DNS is valid
- Check domain status in Vercel dashboard
- SSL is provisioned via Let's Encrypt (free)

### ❌ Site Not Loading

**Check:**
1. DNS propagation: https://dnschecker.org/#A/theshandi.com
2. Vercel deployment status
3. Environment variables are set
4. Clear browser cache

### ❌ Build Errors

**Check Vercel Build Logs:**
1. Go to: **Deployments** tab
2. Click on failed deployment
3. Check build logs for errors
4. Common issues:
   - Missing environment variables
   - Build command errors
   - TypeScript errors

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# View deployments
vercel ls

# View project info
vercel project ls

# View domains
vercel domains ls

# Check deployment status
vercel inspect [deployment-url]
```

---

## Success Checklist

- [ ] Domain added in Vercel dashboard
- [ ] A record (@) added in Namecheap → `76.76.21.21`
- [ ] CNAME record (www) added in Namecheap → `cname.vercel-dns.com`
- [ ] DNS propagated (check with dnschecker.org)
- [ ] Vercel shows "Valid Configuration"
- [ ] SSL certificate active (shows 🔒 in browser)
- [ ] Site loads at https://theshandi.com
- [ ] Environment variables configured
- [ ] All features working on live site

---

## Next Steps After Domain is Live

1. **Test all features** on the live domain
2. **Set up automatic deployments** (connect GitHub repo)
3. **Monitor performance** in Vercel Analytics
4. **Configure redirects** if needed (www → non-www)
5. **Set up monitoring** and error tracking

---

## Support

- **Vercel Support:** https://vercel.com/support
- **Namecheap Support:** Chat with Live Person (in dashboard)
- **DNS Checker:** https://dnschecker.org
- **Vercel Docs:** https://vercel.com/docs

