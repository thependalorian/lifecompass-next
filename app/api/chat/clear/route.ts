// app/api/chat/clear/route.ts
// API endpoint to clear chat history for a specific user/session

import { NextRequest, NextResponse } from "next/server";
import { deleteChatHistory } from "@/lib/db/neon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    // Validate sessionId is a valid UUID
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        sessionId,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid sessionId format" },
        { status: 400 },
      );
    }

    // Delete chat history for this session/user
    const result = await deleteChatHistory(sessionId, userId);

    return NextResponse.json({
      success: true,
      messagesDeleted: result.messagesDeleted,
      sessionsDeleted: result.sessionsDeleted,
    });
  } catch (error: any) {
    console.error("Clear chat history error:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history", details: error.message },
      { status: 500 },
    );
  }
}

