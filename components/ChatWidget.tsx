// components/ChatWidget.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
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

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-om-heritage-green hover:bg-om-fresh-green text-white shadow-2xl z-50 flex items-center justify-center transition-all duration-200 active:scale-95"
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
          className={`fixed ${
            isMaximized
              ? "inset-4"
              : "bottom-6 right-6 w-96 h-[600px]"
          } bg-base-100 rounded-2xl shadow-2xl flex flex-col z-50 border border-base-300 transition-all duration-300`}
        >
          {/* Header */}
          <div className="bg-om-heritage-green text-white p-4 rounded-t-2xl flex items-center justify-between">
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
                <div className="font-bold">LifeCompass Personal Assistant</div>
                <div className="text-xs opacity-90">Online</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
            {isLoading && (
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
                <div className="bg-base-200 rounded-2xl px-4 py-2">
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
          <div className="p-4 border-t border-base-300">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="input input-bordered flex-1 input-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="btn btn-sm bg-om-heritage-green hover:bg-om-fresh-green text-white border-none rounded-full"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
