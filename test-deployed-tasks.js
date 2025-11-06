const fetch = require('node-fetch');

async function testTasks() {
  const baseUrl = 'https://lifecompass-4v30zudh6-buffr.vercel.app';
  const bypassToken = 'O2uuivTuFTVw4jU5zQdca8vTRPtifry8';
  
  console.log('Testing tasks API on deployed app...');
  
  try {
    // Test with advisor number
    const response1 = await fetch(`${baseUrl}/api/tasks?advisorId=ADV-003&x-vercel-protection-bypass=${bypassToken}`);
    const data1 = await response1.json();
    
    console.log('Response status:', response1.status);
    if (Array.isArray(data1)) {
      console.log('✅ Tasks returned:', data1.length);
      console.log('Sample task:', data1[0]);
    } else {
      console.log('❌ Error response:', data1);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testTasks();
