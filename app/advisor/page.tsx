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

interface DashboardStats {
  activeClients: number;
  tasksToday: number;
  meetingsScheduled: number;
  monthlyTarget: number;
  currentSales: number;
  conversionRate: number;
  avgResponseTime: string;
  clientSatisfaction: number;
}

interface RecentTask {
  id: string;
  type: string;
  client: string;
  priority: string;
  description: string;
  dueDate: string;
}

interface Advisor {
  id: string;
  name: string;
  advisorNumber: string;
}

export default function AdvisorDashboard() {
  const router = useRouter();
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setSelectedAdvisor({
          id: parsed.id,
          name: parsed.name,
          advisorNumber: parsed.advisorNumber || parsed.id,
        });
      } catch (e) {
        console.error("Error parsing advisor data:", e);
        setError("Failed to load advisor data");
        setLoading(false);
      }
    }

    // Fetch all advisors for selector
    const fetchAdvisors = async () => {
      try {
        const response = await fetch("/api/advisors");
        if (!response.ok) throw new Error("Failed to fetch advisors");
        const data = await response.json();
        setAdvisors(data.map((a: any) => ({
          id: a.id,
          name: a.name,
          advisorNumber: a.advisorNumber || a.id,
        })));
      } catch (err) {
        console.error("Error fetching advisors:", err);
      }
    };

    fetchAdvisors();
  }, [router]);

  // Fetch dashboard data when advisor is selected
  useEffect(() => {
    if (!selectedAdvisor) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/advisors/${selectedAdvisor.id}/dashboard`);
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        
        setDashboardStats(data.stats);
        setRecentTasks(data.recentTasks || []);
        setUpcomingMeetings(data.upcomingMeetings || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedAdvisor]);

  const targetProgress = dashboardStats
    ? (dashboardStats.currentSales / dashboardStats.monthlyTarget) * 100
    : 0;

  if (loading && !dashboardStats) {
    return (
      <CorporateLayout
        heroTitle="Adviser Command Center"
        heroSubtitle="Loading..."
        pageType="advisor"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Advisor", href: "/advisor/select" },
          { label: "Dashboard", href: "/advisor" },
        ]}
      >
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  if (error) {
    return (
      <CorporateLayout
        heroTitle="Adviser Command Center"
        heroSubtitle="Error"
        pageType="advisor"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Advisor", href: "/advisor/select" },
          { label: "Dashboard", href: "/advisor" },
        ]}
      >
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="alert alert-error">{error}</div>
        </div>
      </CorporateLayout>
    );
  }

  if (!selectedAdvisor || !dashboardStats) {
    return null;
  }

  return (
    <CorporateLayout
      heroTitle="Adviser Command Center"
      heroSubtitle={`Welcome back, ${selectedAdvisor.name}`}
      pageType="advisor"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Advisor", href: "/advisor/select" },
        { label: "Dashboard", href: "/advisor" },
      ]}
    >
      {/* Advisor Selector */}
      <section className="bg-om-heritage-green text-white py-3 sm:py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-end">
            <select
              className="bg-white/10 border border-white/30 text-white rounded-full text-sm sm:text-base w-full sm:w-auto max-w-xs sm:max-w-none px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              value={selectedAdvisor.id}
              onChange={(e) => {
                const advisor = advisors.find((a) => a.id === e.target.value);
                if (advisor) {
                  setSelectedAdvisor(advisor);
                  // Update sessionStorage
                  sessionStorage.setItem("selectedAdvisorPersona", advisor.id);
                  sessionStorage.setItem("advisorPersonaData", JSON.stringify(advisor));
                }
              }}
            >
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-om bg-gradient-to-br from-om-green to-om-green/80 text-white"
          >
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm opacity-90">Active Clients</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    {dashboardStats.activeClients}
                  </div>
                </div>
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 opacity-50 flex-shrink-0"
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
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm opacity-90">Tasks Today</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    {dashboardStats.tasksToday}
                  </div>
                </div>
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 opacity-50 flex-shrink-0"
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
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm opacity-90">Meetings Today</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    {dashboardStats.meetingsScheduled}
                  </div>
                </div>
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 opacity-50 flex-shrink-0"
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
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm text-om-grey">Satisfaction</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-om-green">
                    {dashboardStats.clientSatisfaction}
                  </div>
                </div>
                <div className="rating rating-xs sm:rating-sm flex-shrink-0">
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
      <section className="container mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="card-om">
          <div className="card-body p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-bold text-om-navy">
                Monthly Sales Target
              </h2>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-om-green">
                  N${dashboardStats.currentSales.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-om-grey">
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
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-om-grey mt-2">
              <span>{Math.round(targetProgress)}% Complete</span>
              <span className="break-words">
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
      <section className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Priority Tasks */}
          <div className="card-om">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-bold text-om-navy">
                  Priority Tasks
                </h2>
                <Link
                  href="/advisor/tasks"
                  className="btn btn-xs sm:btn-sm btn-om-outline w-full sm:w-auto"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task, idx) => (
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
                  ))
                ) : (
                  <div className="text-center text-om-grey py-4">
                    No tasks found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="card-om">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-bold text-om-navy">
                  Today's Meetings
                </h2>
                <button className="btn btn-xs sm:btn-sm btn-om-outline w-full sm:w-auto">
                  Schedule New
                </button>
              </div>
              <div className="space-y-3">
                {upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 sm:p-4 bg-base-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-2 gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-om-navy break-words">
                            {meeting.client}
                          </div>
                          <div className="text-xs sm:text-sm text-om-grey break-words">
                            {meeting.type}
                          </div>
                        </div>
                        <div
                          className={`badge badge-xs sm:badge-sm ${
                            meeting.status === "Confirmed"
                              ? "badge-om-active"
                              : "badge-om-pending"
                          } flex-shrink-0`}
                        >
                          {meeting.status}
                        </div>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-om-green font-semibold">
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
                  ))
                ) : (
                  <div className="text-center text-om-grey py-4">
                    No meetings scheduled
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/advisor/clients"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body p-4 sm:p-6 items-center text-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-om-green mb-2"
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
              <h3 className="font-bold text-sm sm:text-base text-om-navy break-words">Find Clients</h3>
            </div>
          </Link>
          <Link
            href="/advisor/tasks"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body p-4 sm:p-6 items-center text-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-om-navy mb-2"
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
              <h3 className="font-bold text-sm sm:text-base text-om-navy break-words">Manage Tasks</h3>
            </div>
          </Link>
          <Link
            href="/advisor/insights"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body p-4 sm:p-6 items-center text-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-om-gold mb-2"
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
              <h3 className="font-bold text-sm sm:text-base text-om-navy break-words">View Insights</h3>
            </div>
          </Link>
          <Link
            href="/advisor/knowledge"
            className="card-om hover:shadow-xl transition-shadow"
          >
            <div className="card-body p-4 sm:p-6 items-center text-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-om-green mb-2"
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
              <h3 className="font-bold text-sm sm:text-base text-om-navy break-words">Knowledge Base</h3>
            </div>
          </Link>
        </div>
      </section>
    </CorporateLayout>
  );
}

