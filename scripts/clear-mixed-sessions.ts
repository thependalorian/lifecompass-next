// scripts/clear-mixed-sessions.ts
// Clear all sessions and messages from Neon to fix user isolation issues
// Note: This script should be run with tsx or ts-node, not as part of Next.js build

import { neon } from "@neondatabase/serverless";

// Environment variables are loaded from .env automatically by Node.js/tsx
const sql = neon(process.env.DATABASE_URL!);

async function clearMixedSessions() {
  try {
    console.log("Connecting to Neon database...");

    // Delete all messages first (foreign key constraint)
    console.log("Deleting all messages...");
    await sql`DELETE FROM messages`;
    console.log("✓ All messages deleted");

    // Delete all sessions
    console.log("Deleting all sessions...");
    await sql`DELETE FROM sessions`;
    console.log("✓ All sessions deleted");

    // Verify deletion
    const messageCount = await sql`SELECT COUNT(*)::int as count FROM messages`;
    const sessionCount = await sql`SELECT COUNT(*)::int as count FROM sessions`;

    console.log("\n✅ Cleanup complete!");
    console.log(`   Messages remaining: ${messageCount[0]?.count || 0}`);
    console.log(`   Sessions remaining: ${sessionCount[0]?.count || 0}`);

    console.log("\n⚠️  IMPORTANT: Clear browser storage as well:");
    console.log("   - localStorage: chatWidget_messages_*");
    console.log("   - sessionStorage: chatWidget_sessionId_*");
    console.log("   - sessionStorage: selectedCustomerPersona");
    console.log("   - sessionStorage: selectedAdvisorPersona");
  } catch (error) {
    console.error("❌ Error clearing sessions:", error);
    process.exit(1);
  }
}

clearMixedSessions();

