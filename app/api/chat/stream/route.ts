// app/api/chat/stream/route.ts

import { NextRequest } from "next/server";
import { createAgent } from "@/lib/agent";
import { ChatRequest } from "@/lib/agent/models";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          resetAt: rateLimitResult.resetAt,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const body: ChatRequest = await request.json();

    // Security: Extract persona information from request metadata
    const metadata = {
      ...body.metadata,
      selectedCustomerPersona: body.metadata?.selectedCustomerPersona,
      selectedAdvisorPersona: body.metadata?.selectedAdvisorPersona,
      userType: body.metadata?.userType || "customer",
    };

    // For demo purposes, return a mock streaming response if database isn't configured
    if (!process.env.DATABASE_URL) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const message = `Demo streaming response: I understand you're asking about "${body.message}". In a full implementation, I would search our knowledge base and provide personalized assistance. Please configure the DATABASE_URL environment variable for full functionality.`;

          // Send metadata first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "metadata", sessionId: body.sessionId || "demo-session", sources: [], toolsUsed: [] })}\n\n`,
            ),
          );

          // Stream the message word by word
          const words = message.split(" ");
          for (const word of words) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "content", content: word + " " })}\n\n`,
              ),
            );
            // Small delay to simulate streaming
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
        },
      });
    }

    const agent = createAgent({
      sessionId: body.sessionId || "",
      userId: body.userId,
      searchPreferences: {
        useVector: true,
        useGraph: true,
        defaultLimit: 10,
      },
      metadata: metadata, // Pass persona info in metadata
    });

    const { stream, sessionId, sources, toolsUsed } =
      await agent.streamResponse({
        ...body,
        metadata: metadata, // Ensure persona info is passed to agent
      });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // Send metadata first
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "metadata", sessionId, sources, toolsUsed })}\n\n`,
          ),
        );

        // Stream LLM response
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "content", content })}\n\n`,
              ),
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Limit": "30",
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return new Response(JSON.stringify({ error: "Stream failed" }), {
      status: 500,
    });
  }
}
