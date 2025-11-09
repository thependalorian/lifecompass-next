// components/ChatWidget.tsx
// Enhanced Chat Widget with streaming, file uploads, and improved UI
// Replaces CopilotKit with a simpler, more maintainable solution

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PaperClipIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  usePersonaState,
  dispatchPersonaChanged,
} from "@/lib/hooks/usePersonaState";
import { usePathname, useRouter } from "next/navigation";

interface ChunkResult {
  chunkId?: string;
  documentId?: string;
  content?: string;
  score?: number;
  metadata?: Record<string, any>;
  documentTitle?: string;
  documentSource?: string;
}

interface ToolCall {
  toolName?: string;
  name?: string;
  tool?: string;
  args?: Record<string, any>;
  toolCallId?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: Array<{ name: string; type: string; size: number }>;
  sources?: ChunkResult[] | string[];
  toolsUsed?: ToolCall[] | string[];
}

interface StreamState {
  type:
    | "thinking"
    | "searching"
    | "tool_executing"
    | "file_processing"
    | "responding";
  message?: string;
  toolName?: string;
  progress?: number;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingContent, setCurrentStreamingContent] = useState("");
  const [streamState, setStreamState] = useState<StreamState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingContentRef = useRef<string>("");
  const rafRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const streamingDelayMs = 50; // Delay between content updates (50ms = ~20 updates/sec)

  const personaState = usePersonaState();
  const pathname = usePathname();
  const router = useRouter();
  const sessionIdRef = useRef<string>("");
  const [personaName, setPersonaName] = useState<string | null>(null);

  // Pages where chat should NOT be available
  const restrictedPages = ["/", "/customer/select", "/advisor/select"];
  const isChatPage = pathname === "/chat";

  // Check if chat should be available
  const chatAvailable =
    !restrictedPages.includes(pathname) &&
    !!(personaState.customerPersona || personaState.advisorPersona);

  // Auto-open and maximize on chat page
  useEffect(() => {
    if (isChatPage && chatAvailable) {
      setIsOpen(true);
      setIsMaximized(true);
    }
  }, [isChatPage, chatAvailable]);

  // Get current persona ID for storage key
  const getPersonaId = useCallback(() => {
    if (typeof window === "undefined") return null;
    const customerPersona = sessionStorage.getItem("selectedCustomerPersona");
    const advisorPersona = sessionStorage.getItem("selectedAdvisorPersona");
    return advisorPersona || customerPersona || null;
  }, []);

  // Fetch persona name for personalized greeting
  useEffect(() => {
    const fetchPersonaName = async () => {
      if (!personaState.customerPersona && !personaState.advisorPersona) {
        setPersonaName(null);
        return;
      }

      try {
        const params = new URLSearchParams();
        // CRITICAL FIX: Only send the active persona, not both
        // Prioritize customer persona if both exist (shouldn't happen, but safety)
        if (personaState.customerPersona) {
          params.set("customerPersona", personaState.customerPersona);
          // Don't send advisor persona if customer is set
        } else if (personaState.advisorPersona) {
          params.set("advisorPersona", personaState.advisorPersona);
        }

        const response = await fetch(`/api/persona/name?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setPersonaName(data.firstName || data.name || null);
        } else if (response.status === 404) {
          // Persona doesn't exist (e.g., ADV-018), clear it
          console.warn(`[ChatWidget] Persona not found, clearing from sessionStorage`);
          if (personaState.advisorPersona) {
            sessionStorage.removeItem("selectedAdvisorPersona");
            sessionStorage.removeItem("advisorPersonaData");
            dispatchPersonaChanged();
          }
          setPersonaName(null);
        }
      } catch (error) {
        console.error("Failed to fetch persona name:", error);
        setPersonaName(null);
      }
    };

    fetchPersonaName();
  }, [personaState.customerPersona, personaState.advisorPersona]);

  // Get or create sessionId for current persona
  // The backend agent will create/return a proper UUID sessionId
  const getSessionId = useCallback(() => {
    if (typeof window === "undefined") return "";
    const personaId = getPersonaId();
    if (!personaId) return "";

    const storageKey = `chatWidget_sessionId_${personaId}`;
    // Get stored sessionId (will be set by backend response)
    return sessionStorage.getItem(storageKey) || "";
  }, [getPersonaId]);

  // Helper function to generate personalized greeting
  // CRITICAL FIX: Prioritize customer persona to prevent advisor greeting for customers
  const getGreeting = useCallback(() => {
    // Prioritize customer persona if both exist (shouldn't happen, but safety check)
    if (personaState.customerPersona && !personaState.advisorPersona) {
      // Customer greeting - aligned with CUSTOMER_SYSTEM_PROMPT
      return personaName
        ? `Hello ${personaName}! I'm your LifeCompass personal assistant. I can help you with your policies, claims, products, and connect you with advisors. How can I assist you today?`
        : "Hello! I'm your LifeCompass personal assistant. I can help you with your policies, claims, products, and connect you with advisors. How can I assist you today?";
    } else if (personaState.advisorPersona && !personaState.customerPersona) {
      // Advisor greeting - aligned with ADVISER_SYSTEM_PROMPT
      return personaName
        ? `Hello ${personaName}! I'm your LifeCompass Command Center assistant. I can help you manage clients, view tasks, access the knowledge base, and track performance. What would you like to do?`
        : "Hello! I'm your LifeCompass Command Center assistant. I can help you manage clients, view tasks, access the knowledge base, and track performance. What would you like to do?";
    } else if (personaState.customerPersona && personaState.advisorPersona) {
      // Both exist - prioritize customer (shouldn't happen, but safety)
      console.warn("[ChatWidget] Both personas detected, prioritizing customer");
      return personaName
        ? `Hello ${personaName}! I'm your LifeCompass personal assistant. I can help you with your policies, claims, products, and connect you with advisors. How can I assist you today?`
        : "Hello! I'm your LifeCompass personal assistant. I can help you with your policies, claims, products, and connect you with advisors. How can I assist you today?";
    }
    // Default greeting when no persona is selected
    return "Hello! I'm LifeCompass, your AI assistant for Old Mutual Namibia. I can help you navigate your financial future. How can I help you today?";
  }, [personaState.advisorPersona, personaState.customerPersona, personaName]);

  // Load persisted messages for current persona
  useEffect(() => {
    if (typeof window !== "undefined") {
      const personaId = getPersonaId();
      if (!personaId) {
        setMessages([]);
        setIsStreaming(false);
        setCurrentStreamingContent("");
        setStreamState(null);
        return;
      }

      try {
        const storageKey = `chatWidget_messages_${personaId}`;
        const saved = localStorage.getItem(storageKey);

        // Get or create sessionId for this persona
        sessionIdRef.current = getSessionId();

        // Reset streaming state when switching personas
        setIsStreaming(false);
        setCurrentStreamingContent("");
        setStreamState(null);
        streamingContentRef.current = "";
        lastUpdateTimeRef.current = 0; // Reset timing
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        if (saved) {
          const parsed = JSON.parse(saved);
          const messages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          
          // Update welcome message if it's the first message and personaName is now available
          if (messages.length > 0 && messages[0].role === "assistant" && personaName) {
            const firstMsg = messages[0].content;
            // Check if it's a generic greeting (doesn't start with "Hello [Name]")
            if (firstMsg.startsWith("Hello!") && !firstMsg.startsWith(`Hello ${personaName}`)) {
              messages[0].content = getGreeting();
            }
          }
          
          setMessages(messages);
        } else {
          // Initial welcome message for this persona with personalized greeting
          setMessages([
            {
              role: "assistant",
              content: getGreeting(),
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.warn("Failed to load persisted messages:", error);
        // Reset to welcome message on error with personalized greeting
        setMessages([
          {
            role: "assistant",
            content: getGreeting(),
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [
    personaState.customerPersona,
    personaState.advisorPersona,
    getPersonaId,
    getSessionId,
    personaName,
    getGreeting,
  ]);

  // Persist messages to persona-specific localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      const personaId = getPersonaId();
      if (!personaId) return;

      try {
        const storageKey = `chatWidget_messages_${personaId}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.warn("Failed to persist messages:", error);
      }
    }
  }, [messages, getPersonaId]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingContent]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = useCallback(async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      files: selectedFiles.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFiles([]);
    setIsLoading(true);
    setIsStreaming(true);
    setCurrentStreamingContent("");
    streamingContentRef.current = "";
    lastUpdateTimeRef.current = 0; // Reset timing for new stream
    setStreamState({ type: "thinking", message: "Processing your request..." });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Get selected persona from sessionStorage
      const selectedCustomerPersona =
        typeof window !== "undefined"
          ? sessionStorage.getItem("selectedCustomerPersona")
          : null;
      const selectedAdvisorPersona =
        typeof window !== "undefined"
          ? sessionStorage.getItem("selectedAdvisorPersona")
          : null;

      // Determine user type based on selected persona
      const userType = selectedAdvisorPersona ? "advisor" : "customer";

      // Get sessionId for current persona
      const currentSessionId = getSessionId();

      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append("message", input);
      formData.append(
        "metadata",
        JSON.stringify({
          sessionId: currentSessionId,
          selectedCustomerPersona: selectedCustomerPersona || undefined,
          selectedAdvisorPersona: selectedAdvisorPersona || undefined,
          userType: userType,
        }),
      );

      // Append files
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Use streaming endpoint
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let metadata: any = null;
      let fullContent = "";

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setIsStreaming(false);
              // Ensure final content is set
              if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }
              setCurrentStreamingContent(streamingContentRef.current);
              // Add final message
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: fullContent,
                  timestamp: new Date(),
                  sources: metadata?.sources,
                  toolsUsed: metadata?.toolsUsed,
                },
              ]);
              setStreamState(null);
              streamingContentRef.current = "";
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "session") {
                // Store sessionId returned from backend (proper UUID)
                const personaId = getPersonaId();
                if (personaId && parsed.sessionId) {
                  const storageKey = `chatWidget_sessionId_${personaId}`;
                  sessionStorage.setItem(storageKey, parsed.sessionId);
                  sessionIdRef.current = parsed.sessionId;
                }
              } else if (parsed.type === "metadata") {
                metadata = parsed;
                // Update state based on metadata (only if no explicit state was set)
                // Check if we already have a non-thinking state
                if (parsed.toolsUsed && parsed.toolsUsed.length > 0) {
                  const firstTool = parsed.toolsUsed[0];
                  const toolName =
                    typeof firstTool === "string"
                      ? firstTool
                      : firstTool?.name || firstTool?.tool || "tool";
                  setStreamState({
                    type: "tool_executing",
                    message: `Executing ${toolName}...`,
                    toolName: toolName,
                  });
                } else if (parsed.sources && parsed.sources.length > 0) {
                  setStreamState({
                    type: "searching",
                    message: `Searching knowledge base...`,
                    progress: 50,
                  });
                } else if (fullContent.length === 0) {
                  // Only set responding state if we haven't started streaming content yet
                  setStreamState({
                    type: "responding",
                    message: "Generating response...",
                  });
                }
              } else if (parsed.type === "content") {
                fullContent += parsed.content;
                streamingContentRef.current = fullContent;

                // Throttle updates with configurable delay for smoother, slower streaming
                // This adds a delay between content updates to slow down the streaming speed
                const now = Date.now();
                const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

                if (rafRef.current === null) {
                  if (
                    timeSinceLastUpdate >= streamingDelayMs ||
                    lastUpdateTimeRef.current === 0
                  ) {
                    // Enough time has passed or first update, schedule immediate update
                    rafRef.current = requestAnimationFrame(() => {
                      setCurrentStreamingContent(streamingContentRef.current);
                      setStreamState({
                        type: "responding",
                        message: "Streaming response...",
                      });
                      lastUpdateTimeRef.current = Date.now();
                      rafRef.current = null;
                    });
                  } else {
                    // Wait for remaining time before updating
                    const remainingDelay =
                      streamingDelayMs - timeSinceLastUpdate;
                    rafRef.current = requestAnimationFrame(() => {
                      setTimeout(() => {
                        setCurrentStreamingContent(streamingContentRef.current);
                        setStreamState({
                          type: "responding",
                          message: "Streaming response...",
                        });
                        lastUpdateTimeRef.current = Date.now();
                        rafRef.current = null;
                      }, remainingDelay);
                    });
                  }
                }
              } else if (parsed.type === "state") {
                // Handle explicit state updates from backend
                setStreamState({
                  type: parsed.stateType || "thinking",
                  message: parsed.message,
                  toolName: parsed.toolName,
                  progress: parsed.progress,
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // User cancelled, don't show error
        return;
      }
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setCurrentStreamingContent("");
      setStreamState(null);
      abortControllerRef.current = null;
    }
  }, [input, selectedFiles, isLoading, personaState]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsStreaming(false);
    setCurrentStreamingContent("");
    setStreamState(null);
  };

  // Clear chat history for current persona
  const handleClearChat = useCallback(async () => {
    const personaId = getPersonaId();
    if (!personaId) return;

    const currentSessionId = sessionIdRef.current || getSessionId();
    const userId =
      personaState.customerPersona || personaState.advisorPersona || "";

    try {
      // Delete from database if we have a sessionId
      if (currentSessionId) {
        try {
          await fetch("/api/chat/clear", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: currentSessionId,
              userId: userId,
            }),
          });
        } catch (error) {
          console.error("Failed to clear database history:", error);
          // Continue with local clearing even if DB fails
        }
      }

      // Clear localStorage messages
      const messagesKey = `chatWidget_messages_${personaId}`;
      localStorage.removeItem(messagesKey);

      // Clear sessionStorage sessionId
      const sessionKey = `chatWidget_sessionId_${personaId}`;
      sessionStorage.removeItem(sessionKey);

      // Reset state with personalized greeting
      // CRITICAL FIX: Use getGreeting() function to ensure consistent logic and prioritize customer persona
      const greeting = getGreeting();

      setMessages([
        {
          role: "assistant",
          content: greeting,
          timestamp: new Date(),
        },
      ]);
      setIsStreaming(false);
      setCurrentStreamingContent("");
      setStreamState(null);
      streamingContentRef.current = "";
      sessionIdRef.current = "";

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  }, [
    getPersonaId,
    getSessionId,
    personaState.advisorPersona,
    personaState.customerPersona,
    personaName,
  ]);

  // Don't render if chat is not available
  if (!chatAvailable) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-om-heritage-green hover:bg-om-fresh-green text-white shadow-2xl z-50 flex items-center justify-center transition-all duration-200 active:scale-95"
          aria-label="Open chat"
        >
          <Image
            src="/logos/OMU.JO.png"
            alt="Old Mutual Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain filter brightness-0 invert"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`${
            isChatPage
              ? "fixed inset-0 rounded-none"
              : isMaximized
                ? "fixed inset-4 rounded-2xl"
                : "fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl"
          } bg-base-100 shadow-2xl flex flex-col z-50 border border-base-300 transition-all duration-300`}
        >
          {/* Header */}
          <div
            className={`bg-om-heritage-green text-white p-4 flex items-center justify-between ${
              isChatPage ? "rounded-none" : "rounded-t-2xl"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-white/20">
                <Image
                  src="/logos/OMU.JO.png"
                  alt="Old Mutual Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <div className="font-bold">LifeCompass Assistant</div>
                <div className="text-xs opacity-90 flex items-center gap-1.5">
                  {streamState ? (
                    <>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          streamState.type === "searching"
                            ? "bg-om-sky animate-pulse"
                            : streamState.type === "tool_executing"
                              ? "bg-om-naartjie animate-pulse"
                              : streamState.type === "file_processing"
                                ? "bg-om-future-green animate-pulse"
                                : "bg-om-fresh-green animate-pulse"
                        }`}
                      />
                      <span>{streamState.message || "Processing..."}</span>
                    </>
                  ) : isStreaming ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-om-fresh-green rounded-full animate-pulse" />
                      <span>Typing...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-om-heritage-green rounded-full" />
                      <span>Online</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isChatPage && (
                <button
                  onClick={handleClearChat}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                  title="Clear Chat History"
                  aria-label="Clear chat history"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
              {isChatPage && (
                <>
                  <button
                    onClick={handleClearChat}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-95"
                    title="Clear Chat History"
                    aria-label="Clear chat history"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      // Navigate back to customer select page
                      router.push("/customer/select");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-95"
                    title="Go Back"
                    aria-label="Go back"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Back
                  </button>
                </>
              )}
              {!isChatPage && (
                <>
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    title={isMaximized ? "Restore" : "Maximize"}
                  >
                    {isMaximized ? (
                      <ArrowsPointingInIcon className="w-5 h-5" />
                    ) : (
                      <ArrowsPointingOutIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsMaximized(false);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    title="Hide Widget"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-om-heritage-green/20 flex-shrink-0">
                    <Image
                      src="/logos/OMU.JO.png"
                      alt="Old Mutual Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-om-heritage-green text-white"
                      : "bg-base-200 text-base-content"
                  }`}
                >
                  {/* File attachments */}
                  {message.files && message.files.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {message.files.map((file, fileIdx) => (
                        <div
                          key={fileIdx}
                          className="text-xs opacity-80 flex items-center gap-1"
                        >
                          <PaperClipIcon className="w-3 h-3" />
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message content */}
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-headings:text-base-content prose-p:text-base-content prose-p:my-2 prose-p:leading-relaxed prose-strong:text-base-content prose-strong:font-semibold prose-ul:text-base-content prose-ol:text-base-content prose-li:text-base-content prose-li:my-1.5 prose-a:text-om-heritage-green prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0 text-sm leading-relaxed">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-base-content">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-3 space-y-1.5 ml-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside mb-3 space-y-1.5 ml-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm leading-relaxed">
                              {children}
                            </li>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0">
                              {children}
                            </h3>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              className="text-om-heritage-green hover:underline font-medium"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                          br: () => <br className="mb-2" />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}

                  {/* Sources and tools */}
                  {(message.sources || message.toolsUsed) && (
                    <div className="mt-3 pt-3 border-t border-om-grey-15 space-y-2">
                      {message.sources &&
                        message.sources.length > 0 &&
                        (() => {
                          // Get unique sources by documentTitle or documentSource
                          const uniqueSources = message.sources.reduce(
                            (acc: (ChunkResult | string)[], source) => {
                              const sourceTitle =
                                typeof source === "string"
                                  ? source
                                  : source?.documentTitle ||
                                    source?.documentSource ||
                                    source?.metadata?.title ||
                                    "";
                              const sourceId =
                                typeof source === "string"
                                  ? source
                                  : source?.documentId ||
                                    source?.chunkId ||
                                    sourceTitle;

                              // Check if we already have this source
                              const exists = acc.some((existing) => {
                                const existingTitle =
                                  typeof existing === "string"
                                    ? existing
                                    : existing?.documentTitle ||
                                      existing?.documentSource ||
                                      existing?.metadata?.title ||
                                      "";
                                const existingId =
                                  typeof existing === "string"
                                    ? existing
                                    : existing?.documentId ||
                                      existing?.chunkId ||
                                      existingTitle;
                                return (
                                  existingId === sourceId ||
                                  existingTitle === sourceTitle
                                );
                              });

                              if (!exists) {
                                acc.push(source);
                              }
                              return acc;
                            },
                            [] as (ChunkResult | string)[],
                          );

                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-om-heritage-green">
                                Sources:
                              </span>
                              {uniqueSources.map((source, idx) => {
                                const sourceTitle =
                                  typeof source === "string"
                                    ? source
                                    : source?.documentTitle ||
                                      source?.documentSource ||
                                      source?.metadata?.title ||
                                      `Source ${idx + 1}`;
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-om-sky/10 text-om-sky rounded-md text-xs border border-om-sky/20"
                                    title={
                                      typeof source === "object"
                                        ? source?.content?.substring(0, 100)
                                        : undefined
                                    }
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    {sourceTitle}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })()}
                      {message.toolsUsed && message.toolsUsed.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-om-naartjie">
                            Tools:
                          </span>
                          {message.toolsUsed.map((tool, idx) => {
                            const toolName =
                              typeof tool === "string"
                                ? tool
                                : tool?.toolName ||
                                  tool?.name ||
                                  tool?.tool ||
                                  `Tool ${idx + 1}`;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-om-naartjie/10 text-om-naartjie rounded-md text-xs border border-om-naartjie/20"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {toolName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Stream State Indicator - Brand-Aligned */}
            {streamState && !currentStreamingContent && (
              <div className="flex items-start justify-start gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-om-heritage-green/20 flex-shrink-0">
                  <Image
                    src="/logos/OMU.JO.png"
                    alt="Old Mutual Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="bg-base-200 rounded-2xl px-4 py-3 max-w-[80%] border border-om-grey-15 shadow-sm transition-all duration-300 hover:shadow-md">
                  {/* State-specific styling based on type */}
                  <div
                    className={`flex items-center gap-3 transition-colors duration-300 ${
                      streamState.type === "searching"
                        ? "text-om-sky"
                        : streamState.type === "tool_executing"
                          ? "text-om-naartjie"
                          : streamState.type === "file_processing"
                            ? "text-om-future-green"
                            : "text-om-heritage-green"
                    }`}
                  >
                    {/* Animated indicator with brand colors */}
                    <div className="flex items-center gap-1">
                      {streamState.type === "searching" ? (
                        // Sky blue pulsing dots for searching
                        <>
                          <div
                            className="w-2 h-2 bg-om-sky rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-om-sky rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-om-sky rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </>
                      ) : streamState.type === "tool_executing" ? (
                        // Naartjie orange spinning indicator for tool execution
                        <div className="relative w-4 h-4">
                          <div className="absolute inset-0 border-2 border-om-naartjie border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : streamState.type === "file_processing" ? (
                        // Future green pulsing for file processing
                        <div className="w-3 h-3 bg-om-future-green rounded-full animate-pulse" />
                      ) : (
                        // Heritage green bouncing dot for thinking/responding
                        <div className="w-2.5 h-2.5 bg-om-heritage-green rounded-full animate-bounce" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-base-content">
                      {streamState.message || "Processing..."}
                    </span>
                  </div>

                  {/* Tool name with brand styling */}
                  {streamState.toolName && (
                    <div className="mt-2 px-2 py-1 bg-om-naartjie/10 rounded-md border border-om-naartjie/20">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-om-naartjie rounded-full" />
                        <span className="text-xs font-semibold text-om-naartjie">
                          {streamState.toolName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Progress bar with brand gradient */}
                  {streamState.progress !== undefined && (
                    <div className="mt-3 w-full bg-om-grey-15 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{
                          width: `${streamState.progress}%`,
                          background:
                            streamState.type === "searching"
                              ? "linear-gradient(90deg, #00c0e8 40%, #009677 60%)" // Sky to Heritage Green
                              : streamState.type === "tool_executing"
                                ? "linear-gradient(90deg, #f37021 40%, #009677 60%)" // Naartjie to Heritage Green
                                : "linear-gradient(90deg, #8dc63f 40%, #009677 60%)", // Future Green to Heritage Green (primary vignette)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Streaming content */}
            {isStreaming && currentStreamingContent && (
              <div className="flex items-start justify-start gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-om-heritage-green/20 flex-shrink-0">
                  <Image
                    src="/logos/OMU.JO.png"
                    alt="Old Mutual Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="bg-base-200 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {currentStreamingContent}
                    </ReactMarkdown>
                  </div>
                  {streamState && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-om-grey-15">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-om-fresh-green rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-om-heritage-green">
                          {streamState.message || "Streaming response..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading indicator - Brand-aligned */}
            {isLoading && !isStreaming && !streamState && (
              <div className="flex items-start justify-start gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-om-heritage-green/20 flex-shrink-0">
                  <Image
                    src="/logos/OMU.JO.png"
                    alt="Old Mutual Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="bg-base-200 rounded-2xl px-4 py-2 border border-om-grey-15">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1.5">
                      <div
                        className="w-2 h-2 bg-om-heritage-green rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-om-fresh-green rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-om-future-green rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-xs text-base-content/70 font-medium ml-1">
                      Processing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-base-300 bg-base-200">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-base-100 px-2 py-1 rounded text-xs"
                  >
                    <PaperClipIcon className="w-3 h-3" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-error hover:text-error-focus"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-base-300">
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm btn-ghost"
                title="Attach file"
              >
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Type your message..."
                className="input input-bordered flex-1 input-sm"
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  onClick={handleCancel}
                  className="btn btn-sm btn-error"
                  title="Cancel"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={
                    isLoading || (!input.trim() && selectedFiles.length === 0)
                  }
                  className="btn btn-sm bg-om-heritage-green hover:bg-om-fresh-green text-white border-none rounded-full"
                  title="Send"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
