// Test script for embedding providers (Hugging Face and Google Gemini)
// Usage: node scripts/test-embeddings.js

require('dotenv').config({ path: '.env.local' });

async function testHuggingFace() {
  console.log('\n=== Testing Hugging Face Embeddings ===');
  const { HfInference } = require('@huggingface/inference');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.log('❌ HUGGINGFACE_API_KEY not set');
    return false;
  }
  
  try {
    const hf = new HfInference(apiKey);
    const testText = "LifeCompass is an AI-powered customer experience platform for Old Mutual.";
    
    console.log('Testing model: sentence-transformers/all-mpnet-base-v2');
    const result = await hf.featureExtraction({
      model: 'sentence-transformers/all-mpnet-base-v2',
      inputs: testText,
    });
    
    // Handle different response formats
    let embedding;
    if (Array.isArray(result)) {
      embedding = Array.isArray(result[0]) ? result[0] : result;
    } else {
      embedding = Array.from(result);
    }
    
    console.log(`✅ Hugging Face: Success!`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    if (embedding.length === 768) {
      console.log('   ✅ Correct dimension (768)');
    } else {
      console.log(`   ⚠️  Expected 768 dimensions, got ${embedding.length}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Hugging Face Error: ${error.message}`);
    return false;
  }
}

async function testGoogleGemini() {
  console.log('\n=== Testing Google Gemini Embeddings ===');
  
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('❌ GOOGLE_API_KEY not set');
    return false;
  }
  
  try {
    const testText = "LifeCompass is an AI-powered customer experience platform for Old Mutual.";
    const baseURL = "https://generativelanguage.googleapis.com/v1beta";
    const model = "text-embedding-004";
    const endpoint = `${baseURL}/models/${model}:embedContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: testText }],
        },
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const embedding = data.embedding?.values || data.embedding || [];
    
    console.log(`✅ Google Gemini: Success!`);
    console.log(`   Model: ${model}`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    if (embedding.length === 768) {
      console.log('   ✅ Correct dimension (768)');
    } else {
      console.log(`   ⚠️  Expected 768 dimensions, got ${embedding.length}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Google Gemini Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Embedding Providers for 768 Dimensions\n');
  console.log('Current Configuration:');
  console.log(`  EMBEDDING_PROVIDER: ${process.env.EMBEDDING_PROVIDER || 'not set'}`);
  console.log(`  HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '✅ set' : '❌ not set'}`);
  console.log(`  GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '✅ set' : '❌ not set'}`);
  
  const hfResult = await testHuggingFace();
  const googleResult = await testGoogleGemini();
  
  console.log('\n=== Summary ===');
  if (hfResult) {
    console.log('✅ Hugging Face: Ready for production');
  }
  if (googleResult) {
    console.log('✅ Google Gemini: Ready for production');
  }
  
  if (!hfResult && !googleResult) {
    console.log('❌ No embedding providers are working. Please configure at least one.');
    process.exit(1);
  }
  
  console.log('\n💡 Recommendation:');
  if (hfResult) {
    console.log('   Use Hugging Face (FREE) for Vercel deployment');
    console.log('   Set in Vercel: HUGGINGFACE_API_KEY');
  } else if (googleResult) {
    console.log('   Use Google Gemini for Vercel deployment');
    console.log('   Set in Vercel: GOOGLE_API_KEY');
  }
}

main().catch(console.error);

