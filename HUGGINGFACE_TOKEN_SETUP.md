# Hugging Face Token Setup Guide

## Quick Setup for LifeCompass Embeddings

### Step 1: Token Configuration

For using Hugging Face Inference API with public embedding models, configure your token as follows:

**Token Type:**
- ✅ **Fine-grained** (recommended for security)
- OR **Read** (classic token, simpler but less secure)

**Token Name:**
- `lifecompass` (or any descriptive name)

### Step 2: Required Permissions

**Minimum Required:**
1. ✅ **Inference** → **Make calls to Inference Providers**
   - This is **ESSENTIAL** - enables API calls to public models
   - Used for: `sentence-transformers/all-mpnet-base-v2` (768 dims)

**Optional but Recommended:**
2. ✅ **Repositories** → **Read access to contents of all repos under your personal namespace**
   - Useful if you want to use private models later
   - Not required for public models like `sentence-transformers/all-mpnet-base-v2`

**Not Required:**
- ❌ Write access (unless you plan to upload models)
- ❌ Inference Endpoints management (unless you're deploying custom endpoints)
- ❌ Webhooks
- ❌ Collections
- ❌ Jobs
- ❌ Billing (unless you upgrade to Pro)

### Step 3: Summary of Settings

**For Public Embedding Models (Recommended):**
```
Token Type: Fine-grained
Token Name: lifecompass

User Permissions:
✅ Inference → Make calls to Inference Providers
✅ Repositories → Read access to contents of all repos under your personal namespace (optional)

Org Permissions: None (leave as default)
Resource Groups: None (leave as default)
```

**Even Simpler (Classic Token):**
```
Token Type: Read (classic)
Token Name: lifecompass
```
- Classic "Read" tokens automatically have inference access
- Less secure but easier to set up

### Step 4: After Creating the Token

1. **Copy the token immediately** - you won't be able to see it again!
2. **Add to your `.env` file:**
   ```bash
   EMBEDDING_PROVIDER=huggingface
   EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
   HUGGINGFACE_API_KEY=your_token_here
   EMBEDDING_API_KEY=your_token_here  # Optional, can use same value
   VECTOR_DIMENSION=768
   ```

3. **Add to Vercel Environment Variables:**
   - Go to your Vercel project settings
   - Add these variables:
     - `EMBEDDING_PROVIDER=huggingface`
     - `EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2`
     - `HUGGINGFACE_API_KEY=your_token_here`
     - `VECTOR_DIMENSION=768`

### Step 5: Test the Token

The token will be used automatically when:
- `EMBEDDING_PROVIDER=huggingface` is set
- `HUGGINGFACE_API_KEY` is set
- The app runs in production (Vercel)

### Important Notes

1. **Free Tier Limits:**
   - Hugging Face Inference API has rate limits on free tier
   - For production workloads, consider upgrading to Pro
   - Monitor usage at: https://huggingface.co/settings/billing

2. **Token Security:**
   - Never commit tokens to Git
   - Use environment variables only
   - Rotate tokens periodically

3. **Model Availability:**
   - Public models are free to use
   - First request may take longer (cold start)
   - Model auto-loads on first use

4. **Alternative:**
   - If you already have `GOOGLE_API_KEY`, you can use Google embeddings instead:
     ```bash
     EMBEDDING_PROVIDER=google
     GOOGLE_API_KEY=your_existing_key
     ```

### Troubleshooting

**Error: "Model is loading"**
- Normal for first request - wait 10-30 seconds
- Subsequent requests will be faster

**Error: "Rate limit exceeded"**
- You've hit the free tier limit
- Wait a few minutes or upgrade to Pro

**Error: "Unauthorized"**
- Check that `HUGGINGFACE_API_KEY` is set correctly
- Verify token has "Make calls to Inference Providers" permission

