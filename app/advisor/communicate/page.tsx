// app/advisor/communicate/page.tsx

"use client";

import { useState } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import ChatWidget from "@/components/ChatWidget";
import { motion } from "framer-motion";

const messages = [
  {
    id: "MSG001",
    client: "Maria Shikongo",
    type: "Incoming",
    subject: "Question about education savings",
    preview:
      "Hi Thomas, I was wondering about the education savings plan you mentioned...",
    date: "2024-11-01",
    read: false,
    priority: "High",
  },
  {
    id: "MSG002",
    client: "John-Paul !Gaeb",
    type: "Outgoing",
    subject: "Insurance renewal reminder",
    preview:
      "Dear John-Paul, your fishing boat insurance is due for renewal...",
    date: "2024-10-28",
    read: true,
    priority: "Medium",
  },
  {
    id: "MSG003",
    client: "Fatima Isaacks",
    type: "Incoming",
    subject: "Application status inquiry",
    preview:
      "Hello, I wanted to check on the status of my funeral insurance application...",
    date: "2024-10-30",
    read: false,
    priority: "Medium",
  },
];

const templates = [
  {
    id: "TPL001",
    name: "Welcome Message",
    category: "Onboarding",
    content:
      "Welcome to Old Mutual! I'm your dedicated advisor and I'm here to help you with all your insurance needs.",
  },
  {
    id: "TPL002",
    name: "Renewal Reminder",
    category: "Policy Management",
    content:
      "Your policy is due for renewal. Please contact me to discuss your options and ensure continuous coverage.",
  },
  {
    id: "TPL003",
    name: "Claim Update",
    category: "Claims",
    content:
      "Your claim has been processed. Here are the details of the payout and next steps.",
  },
];

export default function AdvisorCommunicatePage() {
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const unreadCount = messages.filter((msg) => !msg.read).length;

  return (
    <CorporateLayout
      heroTitle="Communication Center"
      heroSubtitle="Manage client communications and messaging"
      pageType="advisor"
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
              {messages.map((message, idx) => (
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
                      <button className="btn-om-primary btn-sm">Reply</button>
                      <button className="btn-om-outline btn-sm">View</button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                    <button className="btn-om-primary btn-sm">
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
                    />
                    <select className="select select-bordered input-om">
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
                  />
                  <button className="btn-om-primary">Save Template</button>
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
                    <select className="select select-bordered input-om w-full">
                      <option>Select client...</option>
                      <option>Maria Shikongo</option>
                      <option>John-Paul !Gaeb</option>
                      <option>Fatima Isaacks</option>
                      <option>David Ndjavera</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Subject</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-om w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Template</span>
                    </label>
                    <select
                      className="select select-bordered input-om w-full"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
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
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button className="btn-om-primary">Send Message</button>
                <button className="btn-om-outline">Save as Draft</button>
                <button className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <ChatWidget />

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
