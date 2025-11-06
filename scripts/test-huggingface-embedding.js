#!/usr/bin/env node
/**
 * Quick test script for Hugging Face Embeddings API
 * Tests the embedding generation with the configured token
 */

// Simple test using the official package
const { HfInference } = require('@huggingface/inference');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testHuggingFaceEmbedding() {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.EMBEDDING_API_KEY;
  // Force Hugging Face model for testing (ignore local .env settings that might have Ollama)
  const model = process.env.EMBEDDING_MODEL === 'sentence-transformers/all-mpnet-base-v2' 
    ? process.env.EMBEDDING_MODEL 
    : 'sentence-transformers/all-mpnet-base-v2'; // Always use HF model for test
  const baseURL = 'https://router.huggingface.co/hf-inference'; // Updated HF API endpoint

  if (!apiKey) {
    console.error('❌ Error: HUGGINGFACE_API_KEY or EMBEDDING_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('🧪 Testing Hugging Face Embeddings API...');
  console.log(`📦 Model: ${model}`);
  console.log(`🔗 URL: ${baseURL}/${model}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...\n`);

  const testText = 'LifeCompass is a comprehensive CRM and AI assistant for insurance advisors.';

  try {
    console.log('📤 Sending request using @huggingface/inference package...');
    
    const hf = new HfInference(apiKey);
    const output = await hf.featureExtraction({
      model: model,
      inputs: testText,
    });

    // Convert to array
    let embedding;
    if (Array.isArray(output)) {
      embedding = output;
    } else if (output instanceof Float32Array || output instanceof Float64Array) {
      embedding = Array.from(output);
    } else {
      console.error('❌ Error: Unexpected response format');
      console.error('Response type:', typeof output);
      process.exit(1);
    }

    if (!Array.isArray(embedding) || embedding.length === 0) {
      console.error('❌ Error: Invalid embedding format');
      process.exit(1);
    }

    console.log('✅ Success!');
    console.log(`📊 Embedding dimensions: ${embedding.length}`);
    console.log(`📝 First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    if (embedding.length === 768) {
      console.log('✅ Correct dimension (768) for LifeCompass!');
    } else {
      console.log(`⚠️  Warning: Expected 768 dimensions, got ${embedding.length}`);
    }

    console.log('\n✅ Hugging Face Embeddings API is working correctly!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testHuggingFaceEmbedding();

