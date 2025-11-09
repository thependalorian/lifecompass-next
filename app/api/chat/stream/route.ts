// app/api/chat/stream/route.ts

import { NextRequest } from "next/server";
import { createAgent } from "@/lib/agent";
import { ChatRequest } from "@/lib/agent/models";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { validateRequired, validateLength } from "@/lib/utils/error-handling";

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
            "X-RateLimit-Reset": String(
              Math.floor(rateLimitResult.resetAt / 1000),
            ),
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    // Handle both JSON and FormData (for file uploads)
    const contentType = request.headers.get("content-type") || "";
    let body: ChatRequest;
    let files: Array<{ name: string; type: string; size: number }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const message = formData.get("message") as string;
      const metadataStr = formData.get("metadata") as string;

      // Parse metadata
      let metadataObj: any = {};
      try {
        metadataObj = metadataStr ? JSON.parse(metadataStr) : {};
      } catch (e) {
        console.warn("Failed to parse metadata:", e);
      }

      // Get files (FormData entries)
      const fileEntries = formData.getAll("files");
      files = fileEntries
        .filter((f) => f && typeof f === "object" && "name" in f && "size" in f)
        .map((f: any) => ({
          name: f.name || "unknown",
          type: f.type || "application/octet-stream",
          size: f.size || 0,
        }));

      // Validate message
      if (!message || typeof message !== "string") {
        return new Response(
          JSON.stringify({ error: "Message is required" }),
          { status: 400 },
        );
      }

      validateLength(message, 1, 5000, "message", {
        operation: "chat_stream",
      });

      body = {
        message: message.trim(),
        sessionId: metadataObj.sessionId || "",
        userId: metadataObj.userId,
        metadata: metadataObj,
      };
    } else {
      body = await request.json();
      
      // Validate JSON body
      if (!body || typeof body !== "object") {
        return new Response(
          JSON.stringify({ error: "Invalid request body" }),
          { status: 400 },
        );
      }
      
      if (!body.message || typeof body.message !== "string") {
        return new Response(
          JSON.stringify({ error: "Message is required" }),
          { status: 400 },
        );
      }
      
      validateLength(body.message, 1, 5000, "message", {
        operation: "chat_stream",
      });
      
      // Trim message
      body.message = body.message.trim();
    }

    // Security: Extract persona information from request metadata
    const metadata = {
      ...body.metadata,
      selectedCustomerPersona: body.metadata?.selectedCustomerPersona,
      selectedAdvisorPersona: body.metadata?.selectedAdvisorPersona,
      userType: body.metadata?.userType || "customer",
      files: files.length > 0 ? files : undefined,
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
          "X-RateLimit-Reset": String(
            Math.floor(rateLimitResult.resetAt / 1000),
          ),
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

    // Execute agent with timeout (30 seconds max)
    const STREAM_TIMEOUT_MS = 30000;
    let stream: AsyncIterable<any> | null = null;
    let sessionId: string = "";
    let sources: any[] = [];
    let toolsUsed: any[] = [];

    try {
      const result = await Promise.race([
        agent.streamResponse({
          ...body,
          metadata: metadata,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Agent execution timed out")),
            STREAM_TIMEOUT_MS,
          ),
        ),
      ]);

      stream = result.stream;
      sessionId = result.sessionId;
      sources = result.sources || [];
      toolsUsed = result.toolsUsed || [];
    } catch (error) {
      console.error("Agent execution error:", error);
      // Return error stream to client
      const encoder = new TextEncoder();
      const errorReadable = new ReadableStream({
        async start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Failed to generate response",
              })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(errorReadable, {
        status: 500,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial state: searching/processing
          if (sources && sources.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "state",
                  stateType: "searching",
                  message: "Searching knowledge base...",
                  progress: 30,
                })}\n\n`,
              ),
            );
          }

          // Send state: tool execution if tools are being used
          if (toolsUsed && toolsUsed.length > 0) {
            const firstTool = toolsUsed[0];
            const toolName =
              typeof firstTool === "string"
                ? firstTool
                : firstTool?.toolName ||
                  (firstTool as any)?.name ||
                  (firstTool as any)?.tool ||
                  "tool";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "state",
                  stateType: "tool_executing",
                  message: `Executing ${toolName}...`,
                  toolName: toolName,
                  progress: 60,
                })}\n\n`,
              ),
            );
          }

          // Send state: generating response
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "state",
                stateType: "responding",
                message: "Generating response...",
                progress: 80,
              })}\n\n`,
            ),
          );

          // Send sessionId first so frontend can store it
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "session", sessionId })}\n\n`,
            ),
          );

          // Send metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "metadata", sessionId, sources, toolsUsed })}\n\n`,
            ),
          );

          // Stream LLM response with error handling
          if (stream) {
            try {
              for await (const chunk of stream) {
                const content = chunk.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "content", content })}\n\n`,
                    ),
                  );
                }
              }
            } catch (streamError) {
              console.error("Streaming error:", streamError);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    message: "Stream interrupted",
                  })}\n\n`,
                ),
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("Stream controller error:", error);
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "An error occurred during streaming",
                })}\n\n`,
              ),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (closeError) {
            // Controller may already be closed
            console.error("Failed to send error to client:", closeError);
          }
        } finally {
          controller.close();
        }
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
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
            })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(errorStream, {
      status: 500,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
