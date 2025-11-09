// app/advisor/communicate/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import ChatWidget from "@/components/ChatWidget";
import { motion } from "framer-motion";

export default function AdvisorCommunicatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("Onboarding");
  const [templateContent, setTemplateContent] = useState("");
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<
    Array<{ id: string; name: string; customerNumber: string }>
  >([]);

  // Fetch communications and templates
  useEffect(() => {
    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) {
      router.push("/advisor/select");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch communications
        const commResponse = await fetch(
          `/api/communications?advisorNumber=${selectedPersona}`,
        );
        if (commResponse.ok) {
          const commData = await commResponse.json();
          setMessages(commData);
        } else {
          console.error("Failed to fetch communications");
          toast.error("Failed to load communications");
        }

        // Fetch templates
        const templateResponse = await fetch("/api/templates");
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          setTemplates(templateData);
        } else {
          console.error("Failed to fetch templates");
        }

        // Fetch clients for compose dropdown
        const clientsResponse = await fetch(
          `/api/advisors/${selectedPersona}/clients`,
        );
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(
            clientsData.map((c: any) => ({
              id: c.customerId || c.id,
              name: c.name,
              customerNumber: c.customerNumber,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const unreadCount = messages.filter((msg) => !msg.read).length;

  const handleSendMessage = async () => {
    if (!composeRecipient || !composeMessage) {
      toast.error("Please fill in recipient and message");
      return;
    }

    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) {
      toast.error("Please select an advisor");
      return;
    }

    // Find customer ID from recipient name
    const client = clients.find((c) => c.name === composeRecipient);
    if (!client) {
      toast.error("Client not found");
      return;
    }

    try {
      const response = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorNumber: selectedPersona,
          customerId: client.id,
          type: "Email", // Can be made dynamic
          subject: composeSubject || "No subject",
          content: composeMessage,
          status: "Sent",
        }),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setComposeRecipient("");
        setComposeSubject("");
        setComposeMessage("");
        // Refresh messages
        const commResponse = await fetch(
          `/api/communications?advisorNumber=${selectedPersona}`,
        );
        if (commResponse.ok) {
          const commData = await commResponse.json();
          setMessages(commData);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !templateContent) {
      toast.error("Please fill in template name and content");
      return;
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          category: templateCategory,
          content: templateContent,
        }),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setTemplates([...templates, newTemplate]);
        toast.success("Template saved successfully!");
        setTemplateName("");
        setTemplateContent("");
        setTemplateCategory("Onboarding");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Communication Center"
        heroSubtitle="Loading..."
        pageType="advisor"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Advisor", href: "/advisor/select" },
          { label: "Dashboard", href: "/advisor" },
          { label: "Communicate", href: "/advisor/communicate" },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle="Communication Center"
      heroSubtitle="Manage client communications and messaging"
      pageType="advisor"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Advisor", href: "/advisor/select" },
        { label: "Dashboard", href: "/advisor" },
        { label: "Communicate", href: "/advisor/communicate" },
      ]}
    >
      {/* Communication Stats */}
      <section className="py-6 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-om-navy">
                  {unreadCount}
                </div>
                <div className="text-sm text-om-grey">Unread Messages</div>
              </div>
            </div>
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-om-navy">12</div>
                <div className="text-sm text-om-grey">Sent Today</div>
              </div>
            </div>
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-om-navy">4.8</div>
                <div className="text-sm text-om-grey">Response Rate</div>
              </div>
            </div>
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-om-navy">2h</div>
                <div className="text-sm text-om-grey">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="tabs tabs-boxed">
            <a
              className={`tab ${activeTab === "messages" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("messages")}
            >
              Messages{" "}
              {unreadCount > 0 && (
                <span className="badge badge-sm ml-2">{unreadCount}</span>
              )}
            </a>
            <a
              className={`tab ${activeTab === "templates" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              Templates
            </a>
            <a
              className={`tab ${activeTab === "compose" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("compose")}
            >
              Compose
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {activeTab === "messages" && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="card-om p-6 text-center">
                  <p className="text-om-grey">No messages found</p>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`card-om p-6 ${!message.read ? "border-l-4 border-l-om-green" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-om-navy">
                            {message.subject}
                          </h3>
                          <div
                            className={`badge ${message.type === "Incoming" ? "badge-info" : "badge-success"}`}
                          >
                            {message.type}
                          </div>
                          {!message.read && (
                            <div className="badge badge-om-active">New</div>
                          )}
                        </div>

                        <p className="text-om-grey mb-3">{message.preview}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-om-navy">
                            {message.client}
                          </span>
                          <span className="text-om-grey">{message.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          className="btn-om-primary btn-sm"
                          onClick={() => {
                            setActiveTab("compose");
                            setComposeRecipient(message.client);
                            setComposeSubject(`Re: ${message.subject}`);
                          }}
                        >
                          Reply
                        </button>
                        <button
                          className="btn-om-outline btn-sm"
                          onClick={() =>
                            setSelectedMessage(
                              selectedMessage === message.id
                                ? null
                                : message.id,
                            )
                          }
                        >
                          {selectedMessage === message.id ? "Hide" : "View"}
                        </button>
                      </div>
                      {selectedMessage === message.id && (
                        <div className="mt-4 p-4 bg-base-200 rounded-lg">
                          <p className="text-sm text-om-grey whitespace-pre-wrap">
                            {message.preview}
                          </p>
                          <div className="mt-2 text-xs text-om-grey">
                            Priority: {message.priority} | Date: {message.date}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === "templates" && (
            <div className="grid gap-6">
              {templates.map((template, idx) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="card-om p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-om-navy mb-1">
                        {template.name}
                      </h3>
                      <div className="badge badge-outline">
                        {template.category}
                      </div>
                    </div>
                    <button
                      className="btn-om-primary btn-sm"
                      onClick={() => {
                        setActiveTab("compose");
                        setSelectedTemplate(template.id);
                        setComposeMessage(template.content);
                      }}
                    >
                      Use Template
                    </button>
                  </div>

                  <p className="text-om-grey">{template.content}</p>
                </motion.div>
              ))}

              <div className="card-om p-6">
                <h3 className="text-lg font-bold text-om-navy mb-4">
                  Create New Template
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Template name"
                      className="input input-bordered input-om"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <select
                      className="select select-bordered input-om"
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                    >
                      <option>Onboarding</option>
                      <option>Policy Management</option>
                      <option>Claims</option>
                      <option>Follow-up</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Template content..."
                    className="textarea textarea-bordered input-om w-full"
                    rows={4}
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                  />
                  <button
                    className="btn-om-primary"
                    onClick={handleSaveTemplate}
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "compose" && (
            <div className="card-om p-6">
              <h2 className="text-2xl font-bold text-om-navy mb-6">
                Compose Message
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Recipient</span>
                    </label>
                    <select
                      className="select select-bordered input-om w-full"
                      value={composeRecipient}
                      onChange={(e) => setComposeRecipient(e.target.value)}
                    >
                      <option value="">Select client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.name}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Subject</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-om w-full"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Template</span>
                    </label>
                    <select
                      className="select select-bordered input-om w-full"
                      value={selectedTemplate}
                      onChange={(e) => {
                        setSelectedTemplate(e.target.value);
                        const template = templates.find(
                          (t) => t.id === e.target.value,
                        );
                        if (template) {
                          setComposeMessage(template.content);
                        }
                      }}
                    >
                      <option value="">Select template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered input-om w-full"
                    rows={12}
                    placeholder="Type your message here..."
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button className="btn-om-primary" onClick={handleSendMessage}>
                  Send Message
                </button>
                <button
                  className="btn-om-outline"
                  onClick={async () => {
                    if (!composeRecipient || !composeMessage) {
                      toast.error(
                        "Please fill in recipient and message to save as draft",
                      );
                      return;
                    }

                    const selectedPersona = sessionStorage.getItem(
                      "selectedAdvisorPersona",
                    );
                    if (!selectedPersona) {
                      toast.error("Please select an advisor");
                      return;
                    }

                    const client = clients.find(
                      (c) => c.name === composeRecipient,
                    );
                    if (!client) {
                      toast.error("Client not found");
                      return;
                    }

                    try {
                      const response = await fetch("/api/communications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          advisorNumber: selectedPersona,
                          customerId: client.id,
                          type: "Email",
                          subject: composeSubject || "Draft",
                          content: composeMessage,
                          status: "Draft",
                        }),
                      });

                      if (response.ok) {
                        toast.success("Draft saved successfully!");
                      } else {
                        const error = await response.json();
                        toast.error(error.error || "Failed to save draft");
                      }
                    } catch (error) {
                      console.error("Error saving draft:", error);
                      toast.error("Failed to save draft");
                    }
                  }}
                >
                  Save as Draft
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setComposeRecipient("");
                    setComposeSubject("");
                    setComposeMessage("");
                    setSelectedTemplate("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Chat Widget - Enhanced with streaming and file uploads */}
      {/* Note: ChatWidget is now globally available via layout.tsx, so this is redundant */}
      {/* Keeping this comment for reference - ChatWidget will appear as floating button */}

      <footer className="bg-om-navy text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>
            LifeCompass by Old Mutual Namibia - Tech Innovation Hackathon 2025
          </p>
        </div>
      </footer>
    </CorporateLayout>
  );
}
