// scripts/clear-chat-data.ts
// Script to clear all chat-related data from Neon database
// Note: This script should be run with tsx or ts-node, not as part of Next.js build

import { neon } from "@neondatabase/serverless";

// Environment variables are loaded from .env automatically by Node.js/tsx
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function clearChatData() {
  try {
    console.log("🔌 Connecting to Neon database...");

    // Get counts first
    const messagesCount = await sql`
      SELECT COUNT(*) as count FROM messages
    `;
    const sessionsCount = await sql`
      SELECT COUNT(*) as count FROM sessions
    `;

    // Clear messages first (foreign key constraint)
    console.log("🗑️  Clearing messages...");
    await sql`DELETE FROM messages`;
    console.log(`   ✅ Deleted ${messagesCount[0]?.count || 0} messages`);

    // Clear sessions
    console.log("🗑️  Clearing sessions...");
    await sql`DELETE FROM sessions`;
    console.log(`   ✅ Deleted ${sessionsCount[0]?.count || 0} sessions`);

    console.log("\n✅ Chat data cleared successfully!");
    console.log("   - All messages deleted");
    console.log("   - All sessions deleted");
    console.log("\n📝 Note: Browser localStorage/sessionStorage may still contain cached messages.");
    console.log("   To clear browser storage, run the script in your browser console:");
    console.log("   See: scripts/clear-browser-chat-storage.js");
    console.log("   Or manually clear localStorage/sessionStorage keys starting with 'chatWidget_'");
  } catch (error) {
    console.error("❌ Error clearing chat data:", error);
    process.exit(1);
  }
}

// Run the script
clearChatData()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
