// app/chat/page.tsx
// Standalone AI Chat Interface - Customer Self-Service Flow

"use client";

import { useState, useRef, useEffect } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { OMButton } from "@/components/atoms/brand";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your LifeCompass personal assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          metadata: {
            selectedCustomerPersona: selectedCustomerPersona || undefined,
            selectedAdvisorPersona: selectedAdvisorPersona || undefined,
            userType: userType,
          },
        }),
      });
      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected persona to customize quick actions
  const [selectedCustomerPersona, setSelectedCustomerPersona] = useState<
    string | null
  >(null);
  const [selectedAdvisorPersona, setSelectedAdvisorPersona] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Load persona from sessionStorage on mount
    if (typeof window !== "undefined") {
      setSelectedCustomerPersona(
        sessionStorage.getItem("selectedCustomerPersona")
      );
      setSelectedAdvisorPersona(
        sessionStorage.getItem("selectedAdvisorPersona")
      );
    }
  }, []);

  // Helper function to send a message directly
  const sendQuickMessage = async (messageText: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          metadata: {
            selectedCustomerPersona: selectedCustomerPersona || undefined,
            selectedAdvisorPersona: selectedAdvisorPersona || undefined,
            userType: userType,
          },
        }),
      });
      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = selectedAdvisorPersona
    ? [
    {
          label: "View My Tasks",
          action: () => sendQuickMessage("Show me my tasks"),
        },
        {
          label: "View My Clients",
          action: () => sendQuickMessage("Show me my clients"),
        },
        {
          label: "Ask About Products",
          action: () => sendQuickMessage("Tell me about available products"),
        },
      ]
    : [
        {
      label: "View My Policies",
          action: () => sendQuickMessage("Show me my policies"),
    },
    {
      label: "Ask About Claims",
          action: () => sendQuickMessage("How do I file a claim?"),
    },
    {
      label: "Connect with Advisor",
          action: () => sendQuickMessage("I'd like to speak with an advisor"),
    },
  ];

  return (
    <CorporateLayout
      heroTitle="Chat with LifeCompass"
      heroSubtitle="Your AI assistant is here to help"
      pageType="customer"
      showChat={false}
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Chat", href: "/chat" },
      ]}
    >

      {/* Header */}
      <section className="bg-om-heritage-green text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <OMButton variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </OMButton>
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-white/20">
                <Image
                  src="/logos/OMU.JO.png"
                  alt="Old Mutual Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LifeCompass Personal Assistant</h1>
                <p className="text-sm text-white/90">Online - Ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card-om p-6">
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-om-grey-80 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="btn-om-outline btn-sm"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4 mb-6 bg-base-200 rounded-lg">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-om-heritage-green/20 flex-shrink-0">
                      <Image
                        src="/logos/OMU.JO.png"
                        alt="Old Mutual Logo"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-om-heritage-green text-white"
                        : "bg-white text-base-content border border-om-grey-15"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-headings:text-base-content prose-p:text-base-content prose-p:my-2 prose-p:leading-relaxed prose-strong:text-base-content prose-strong:font-semibold prose-ul:text-base-content prose-ol:text-base-content prose-li:text-base-content prose-li:my-1.5 prose-a:text-om-heritage-green prose-a:no-underline hover:prose-a:underline">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0 text-sm leading-relaxed">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-base-content">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-3 space-y-1.5 ml-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-3 space-y-1.5 ml-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm leading-relaxed">{children}</li>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h3>
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
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-10 h-10 rounded-full bg-om-heritage-green text-white flex items-center justify-center flex-shrink-0 font-semibold aspect-square">
                      You
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start justify-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-om-heritage-green/20 flex-shrink-0">
                    <Image
                      src="/logos/OMU.JO.png"
                      alt="Old Mutual Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 border border-om-grey-15">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-om-heritage-green rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-om-heritage-green rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-om-heritage-green rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="input input-bordered flex-1 input-om"
                disabled={isLoading}
              />
              <OMButton
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                variant="primary"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </OMButton>
            </div>

            {/* Escalation CTA */}
            <div className="mt-6 p-4 bg-om-sky/10 border border-om-sky/20 rounded-lg">
              <p className="text-sm text-om-grey-80 mb-2">
                Need human assistance? Your LifeCompass assistant can escalate to a specialized advisor.
              </p>
              <Link href="/advisors">
                <OMButton variant="outline" size="sm">
                  Find an Advisor
                </OMButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </CorporateLayout>
  );
}

