// app/chat/page.tsx
// Standalone AI Chat Interface - Customer Self-Service Flow
// Uses enhanced ChatWidget with streaming and file uploads
// ChatWidget handles its own UI, so this page provides minimal layout

"use client";

import ChatWidget from "@/components/ChatWidget";
import { CorporateLayout } from "@/components/templates/CorporateLayout";

export default function ChatPage() {
  return (
    <CorporateLayout
      heroTitle="Chat with LifeCompass"
      heroSubtitle="Your AI assistant is here to help"
      pageType="customer"
      showChat={false}
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Customer", href: "/customer/select" },
        { label: "Chat", href: "/chat" },
      ]}
    >
      {/* ChatWidget takes full control */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-[600px]">
        <ChatWidget />
      </div>
    </CorporateLayout>
  );
}
