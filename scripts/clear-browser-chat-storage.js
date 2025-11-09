// scripts/clear-browser-chat-storage.js
// Browser console script to clear chat messages from localStorage and sessionStorage
// Run this in your browser console: copy and paste the code below

(function clearChatStorage() {
  console.log("🧹 Clearing chat storage...");
  
  let clearedCount = 0;
  
  // Clear all chatWidget_messages_* keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("chatWidget_messages_")) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`   ✅ Cleared: ${key}`);
    }
  }
  
  // Clear all chatWidget_sessionId_* keys from sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("chatWidget_sessionId_")) {
      sessionStorage.removeItem(key);
      clearedCount++;
      console.log(`   ✅ Cleared: ${key}`);
    }
  }
  
  console.log(`\n✅ Cleared ${clearedCount} chat storage entries!`);
  console.log("🔄 Please refresh the page to see the changes.");
})();

