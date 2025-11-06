# Embedding Models with 768 Dimensions (No OpenAI)

## Current Setup
- **Current Model**: `nomic-embed-text` (Ollama) - 768 dimensions
- **Current Provider**: Ollama (localhost, not available in production)
- **Vector Dimension Setting**: 768
- **Available API Keys**: Google API Key, Groq API Key

## Free Options for Production (768 Dimensions)

### Option 1: Hugging Face Inference API ⭐ FREE & RECOMMENDED
**Model**: `sentence-transformers/all-mpnet-base-v2`  
**Dimensions**: 768  
**Cost**: FREE (with rate limits)  
**API**: Hugging Face Inference API  
**Setup**:
```bash
EMBEDDING_PROVIDER=huggingface
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
EMBEDDING_API_KEY=your_huggingface_token  # Optional for public models
HUGGINGFACE_API_KEY=your_huggingface_token
VECTOR_DIMENSION=768
```
Get free token: https://huggingface.co/settings/tokens

**Other 768-dim models on Hugging Face:**
- `sentence-transformers/all-mpnet-base-v2` (768 dims) ⭐ Recommended
- `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (768 dims)
- `BAAI/bge-small-en-v1.5` (384 dims)
- `BAAI/bge-base-en-v1.5` (768 dims)

### Option 2: Google Gemini Embeddings
**Model**: `text-embedding-004`  
**Dimensions**: 768  
**Cost**: Free tier available  
**API**: Google Generative AI API  
**Setup**:
```bash
EMBEDDING_PROVIDER=google
EMBEDDING_MODEL=text-embedding-004
EMBEDDING_API_KEY=your_google_api_key
GOOGLE_API_KEY=your_google_api_key
VECTOR_DIMENSION=768
```
**Note**: You already have `GOOGLE_API_KEY` set!

### Option 3: Jina Embeddings v3
**Model**: `jina-embeddings-v3`
**Dimensions**: Flexible (supports 768)
**Cost**: Free tier available
**API**: Jina AI
**Setup**:
```bash
EMBEDDING_PROVIDER=jina
EMBEDDING_MODEL=jina-embeddings-v3
EMBEDDING_BASE_URL=https://api.jina.ai/v1
EMBEDDING_API_KEY=your_jina_api_key
VECTOR_DIMENSION=768
```

## Recommended Configuration for Production

**Using Hugging Face (FREE):**
```bash
EMBEDDING_PROVIDER=huggingface
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
HUGGINGFACE_API_KEY=your_token_here  # Optional for public models
VECTOR_DIMENSION=768
```

**Using Google (You already have the key):**
```bash
EMBEDDING_PROVIDER=google
EMBEDDING_MODEL=text-embedding-004
GOOGLE_API_KEY=your_existing_google_key
VECTOR_DIMENSION=768
```

## Model Comparison

| Model | Dimensions | Cost | API | Setup |
|-------|------------|------|-----|-------|
| nomic-embed-text (Ollama) | 768 | Free (local) | Ollama | ❌ Local only |
| sentence-transformers/all-mpnet-base-v2 (HF) | 768 | **FREE** | Hugging Face | ✅ Recommended |
| text-embedding-004 (Google) | 768 | Free tier | Google | ✅ You have key |
| jina-embeddings-v3 | 768 | Free tier | Jina | Requires signup |

## Next Steps

1. **Hugging Face (Best Free Option)**: 
   - Get free token: https://huggingface.co/settings/tokens
   - Set `EMBEDDING_PROVIDER=huggingface`
   - Set `HUGGINGFACE_API_KEY=your_token`

2. **Google (Easiest - You Have Key)**:
   - Set `EMBEDDING_PROVIDER=google`
   - Uses your existing `GOOGLE_API_KEY`

**Note**: Groq does not provide embedding models, only LLM inference.
