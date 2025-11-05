// app/advisor/page.tsx
// Advisor Dashboard - Command Center Flow
// PRD: Welcome Interface, Client Overview, Performance Metrics, Quick Actions

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { TaskCard } from "@/components/molecules/TaskCard";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { OMButton } from "@/components/atoms/brand";

const sampleAdvisors = [
  { id: "ADV-001", name: "Sarah van der Merwe", initials: "SV" },
  { id: "ADV-002", name: "Moses //Garoëb", initials: "MG" },
  { id: "ADV-003", name: "Thomas Shikongo", initials: "TS" },
];

const dashboardStats = {
  activeClients: 130,
  tasksToday: 8,
  meetingsScheduled: 5,
  monthlyTarget: 85000,
  currentSales: 62000,
  conversionRate: 78,
  avgResponseTime: "2.3 hours",
  clientSatisfaction: 4.9,
};

const recentTasks = [
  {
    id: "TASK-001",
    type: "Escalation",
    client: "Maria Shikongo",
    priority: "High",
    description: "Education savings inquiry",
    dueDate: "Today, 2:00 PM",
  },
  {
    id: "TASK-002",
    type: "Follow-up",
    client: "John-Paul !Gaeb",
    priority: "Medium",
    description: "Business insurance quote follow-up",
    dueDate: "Today, 4:30 PM",
  },
  {
    id: "TASK-003",
    type: "Review",
    client: "Fatima Isaacks",
    priority: "Low",
    description: "Annual policy review",
    dueDate: "Tomorrow, 10:00 AM",
  },
];

const upcomingMeetings = [
  {
    id: "MTG-001",
    client: "David Ndjavera",
    time: "11:00 AM",
    type: "Vehicle Insurance Consultation",
    status: "Confirmed",
  },
  {
    id: "MTG-002",
    client: "Helvi Bezuidenhout",
    time: "2:30 PM",
    type: "Investment Portfolio Review",
    status: "Confirmed",
  },
  {
    id: "MTG-003",
    client: "Thomas Kamati",
    time: "4:00 PM",
    type: "Business Insurance Quote",
    status: "Pending",
  },
];

export default function AdvisorDashboard() {
  const router = useRouter();
  const [selectedAdvisor, setSelectedAdvisor] = useState(sampleAdvisors[2]);
  const targetProgress =
    (dashboardStats.currentSales / dashboardStats.monthlyTarget) * 100;

  useEffect(() => {
    // Check if persona is selected
    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) {
      // Redirect to persona selection if not selected
      router.push("/advisor/select");
      return;
    }

    // Load advisor data from sessionStorage if available
    const advisorData = sessionStorage.getItem("advisorPersonaData");
    if (advisorData) {
      try {
        const parsed = JSON.parse(advisorData);
        const found = sampleAdvisors.find((a) => a.id === parsed.id);
        if (found) {
          setSelectedAdvisor(found);
        }
      } catch (e) {
        console.error("Error parsing advisor data:", e);
      }
    }
  }, [router]);

  return (
    <CorporateLayout
      heroTitle="Adviser Command Center"
      heroSubtitle={`Welcome back, ${selectedAdvisor.name}`}
      pageType="advisor"
    >
      {/* Advisor Selector */}
      <section className="bg-om-heritage-green text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end">
            <select
              className="select bg-white/10 border border-white/30 text-white rounded-full"
              value={selectedAdvisor.id}
              onChange={(e) =>
                setSelectedAdvisor(
                  sampleAdvisors.find((a) => a.id === e.target.value) ||
                    sampleAdvisors[0],
                )
              }
            >
              {sampleAdvisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-om bg-gradient-to-br from-om-green to-om-green/80 text-white"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Active Clients</div>
                  <div className="text-4xl font-bold">
                    {dashboardStats.activeClients}
                  </div>
                </div>
                <svg
                  className="w-12 h-12 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-om bg-gradient-to-br from-om-navy to-om-navy/80 text-white"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Tasks Today</div>
                  <div className="text-4xl font-bold">
                    {dashboardStats.tasksToday}
                  </div>
                </div>
                <svg
                  className="w-12 h-12 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-om bg-gradient-to-br from-om-gold to-om-gold/80 text-white"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Meetings Today</div>
                  <div className="text-4xl font-bold">
                    {dashboardStats.meetingsScheduled}
                  </div>
                </div>
                <svg
                  className="w-12 h-12 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-om-grey">Satisfaction</div>
                  <div className="text-4xl font-bold text-om-green">
                    {dashboardStats.clientSatisfaction}
                  </div>
                </div>
                <div className="rating rating-sm">
                  {[...Array(5)].map((_, i) => (
                    <input
                      key={i}
                      type="radio"
                      className="mask mask-star-2 bg-om-gold"
                      checked={
                        i < Math.floor(dashboardStats.clientSatisfaction)
                      }
                      readOnly
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Monthly Target Progress */}
      <section className="container mx-auto px-4 pb-6">
        <div className="card-om">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-om-navy">
                Monthly Sales Target
              </h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-om-green">
                  N${dashboardStats.currentSales.toLocaleString()}
                </div>
                <div className="text-sm text-om-grey">
                  of N${dashboardStats.monthlyTarget.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="w-full bg-base-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-om-green to-om-navy h-4 rounded-full transition-all duration-500"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-om-grey mt-2">
              <span>{Math.round(targetProgress)}% Complete</span>
              <span>
                N$
                {(
                  dashboardStats.monthlyTarget - dashboardStats.currentSales
                ).toLocaleString()}{" "}
                remaining
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Priority Tasks */}
          <div className="card-om">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-om-navy">
                  Priority Tasks
                </h2>
                <Link
                  href="/advisor/tasks"
                  className="btn btn-sm btn-om-outline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentTasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    taskNumber={task.id}
                    taskType={task.type}
                    priority={
                      task.priority.toLowerCase() as
                        | "low"
                        | "medium"
                        | "high"
                        | "urgent"
                    }
                    customerName={task.client}
                    description={task.description}
                    dueDate={task.dueDate}
                    status="open"
                    onViewContext={() => {
                      window.location.href = `/advisor/clients`;
                    }}
                    onMarkComplete={() => {
                      console.log("Task completed:", task.id);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="card-om">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-om-navy">
                  Today's Meetings
                </h2>
                <button className="btn btn-sm btn-om-outline">
                  Schedule New
                </button>
              </div>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 bg-base-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-om-navy">
                          {meeting.client}
                        </div>
                        <div className="text-sm text-om-grey">
                          {meeting.type}
                        </div>
                      </div>
                      <div
                        className={`badge ${
                          meeting.status === "Confirmed"
                            ? "badge-om-active"
                            : "badge-om-pending"
                        }`}
                      >
                        {meeting.status}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-om-green font-semibold">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {meeting.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            href="/advisor/clients"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-green mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="font-bold text-om-navy">Find Clients</h3>
            </div>
          </Link>
          <Link
            href="/advisor/tasks"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-navy mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="font-bold text-om-navy">Manage Tasks</h3>
            </div>
          </Link>
          <Link
            href="/advisor/insights"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-gold mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="font-bold text-om-navy">View Insights</h3>
            </div>
          </Link>
          <Link
            href="/advisor/knowledge"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-green mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="font-bold text-om-navy">Knowledge Base</h3>
            </div>
          </Link>
        </div>
      </section>
    </CorporateLayout>
  );
}
