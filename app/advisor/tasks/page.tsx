// app/advisor/tasks/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";

interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  completedDate: string | null;
  customerId: string | null;
  customerNumber: string | null;
  customerName: string | null;
  advisorId: string;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: string;
}

const priorities = ["All Priorities", "High", "Medium", "Low", "Urgent"];
const statuses = [
  "All Statuses",
  "Open",
  "In Progress",
  "Completed",
  "Cancelled",
];
const types = [
  "All Types",
  "Follow-up",
  "Escalation",
  "Review",
  "Sale",
  "Onboarding",
  "Renewal",
  "Claim Processing",
  "Claims Processing",
  "Investment Review",
  "Product Quote",
  "Business Consultation",
  "Policy Renewal",
  "New Application",
];

export default function AdvisorTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    // Check if persona is selected
    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) {
      router.push("/advisor/select");
      return;
    }

    // Fetch tasks from API
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Get tasks with optional filters
        let url = `/api/tasks?advisorId=${selectedPersona}`;
        if (selectedStatus !== "All Statuses") {
          const statusMap: Record<string, string> = {
            "Open": "open",
            "In Progress": "open",
            "Completed": "completed",
            "Cancelled": "cancelled",
          };
          url += `&status=${statusMap[selectedStatus] || ""}`;
        }
        if (selectedPriority !== "All Priorities") {
          url += `&priority=${selectedPriority.toLowerCase()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router, selectedStatus, selectedPriority]);

  // Refetch when filters change
  useEffect(() => {
    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) return;

    const fetchTasks = async () => {
      try {
        let url = `/api/tasks?advisorId=${selectedPersona}`;
        if (selectedStatus !== "All Statuses") {
          const statusMap: Record<string, string> = {
            "Open": "open",
            "In Progress": "open",
            "Completed": "completed",
            "Cancelled": "cancelled",
          };
          url += `&status=${statusMap[selectedStatus] || ""}`;
        }
        if (selectedPriority !== "All Priorities") {
          url += `&priority=${selectedPriority.toLowerCase()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, [selectedStatus, selectedPriority]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-success";
      case "in progress":
        return "text-warning";
      case "overdue":
        return "text-error";
      case "pending":
        return "text-om-grey";
      default:
        return "text-base-content";
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesType =
        selectedType === "All Types" || task.type === selectedType;
      return matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return (
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          );
        case "createdDate":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  const pendingTasks = filteredTasks.filter(
    (task) =>
      task.status === "Open" || task.status === "In Progress",
  ).length;
  const overdueTasks = filteredTasks.filter(
    (task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== "Completed";
    },
  ).length;
  const completedToday = filteredTasks.filter(
    (task) =>
      task.status === "Completed" &&
      task.completedDate &&
      new Date(task.completedDate).toDateString() === new Date().toDateString(),
  ).length;

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Task Management"
        heroSubtitle="Loading..."
        pageType="advisor"
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  if (error) {
    return (
      <CorporateLayout
        heroTitle="Task Management"
        heroSubtitle="Error"
        pageType="advisor"
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">{error}</div>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle="Task Management"
      heroSubtitle="Track and manage your client tasks and follow-ups"
      pageType="advisor"
    >
      {/* Filters & Stats */}

      {/* Task Stats */}
      <section className="py-6 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-om-navy">
                  {pendingTasks}
                </div>
                <div className="text-sm text-om-grey">Pending Tasks</div>
              </div>
            </div>
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-error">
                  {overdueTasks}
                </div>
                <div className="text-sm text-om-grey">Overdue</div>
              </div>
            </div>
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {completedToday}
                </div>
                <div className="text-sm text-om-grey">Completed Today</div>
              </div>
            </div>
            <div className="card-om bg-white">
              <div className="card-body p-4 text-center">
                <div className="text-2xl font-bold text-om-navy">
                  {tasks.length > 0
                    ? Math.round(
                        (filteredTasks.filter((t) => t.status === "Completed")
                          .length /
                          tasks.length) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-om-grey">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <select
              className="select select-bordered input-om"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered input-om"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered input-om"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered input-om"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="client">Sort by Client</option>
              <option value="createdDate">Sort by Created Date</option>
            </select>
            <button className="btn-om-primary">Create Task</button>
          </div>
        </div>
      </section>

      {/* Tasks List */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-om-navy">
              {filteredTasks.length} Tasks Found
            </h2>
            <div className="text-sm text-om-grey">
              {selectedPriority !== "All Priorities" &&
                `Priority: ${selectedPriority}`}
              {selectedStatus !== "All Statuses" &&
                ` | Status: ${selectedStatus}`}
              {selectedType !== "All Types" && ` | Type: ${selectedType}`}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="card-om p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-om-navy">
                        {task.title}
                      </h3>
                      <div
                        className={`badge ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </div>
                      <div
                        className={`badge badge-outline ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </div>
                    </div>

                    <p className="text-om-grey mb-3">{task.description || task.title}</p>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      {task.customerNumber && (
                        <div>
                          <span className="text-om-grey">Client:</span>
                          <div className="font-semibold text-om-navy">
                            {task.customerName || task.customerNumber}
                          </div>
                          {task.customerNumber && (
                            <div className="text-xs text-om-grey-60">
                              {task.customerNumber}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="text-om-grey">Type:</span>
                        <div className="font-semibold text-om-navy">
                          {task.type}
                        </div>
                      </div>
                      {task.dueDate && (
                        <div>
                          <span className="text-om-grey">Due Date:</span>
                          <div
                            className={`font-semibold ${
                              new Date(task.dueDate) < new Date() &&
                              task.status !== "Completed"
                                ? "text-error"
                                : "text-om-navy"
                            }`}
                          >
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {task.estimatedHours && (
                        <div>
                          <span className="text-om-grey">Estimated Time:</span>
                          <div className="font-semibold text-om-navy">
                            {task.estimatedHours} hours
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button className="btn-om-primary btn-sm">
                      {task.status === "Completed" ? "View" : "Complete"}
                    </button>
                    <button className="btn-om-outline btn-sm">Edit</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 text-om-grey">No tasks found</div>
              <h3 className="text-xl font-bold text-om-navy mb-2">
                No Tasks Match Your Criteria
              </h3>
              <p className="text-om-grey mb-4">
                Try adjusting your filters or create a new task.
              </p>
              <button
                className="btn-om-primary"
                onClick={() => {
                  setSelectedPriority("All Priorities");
                  setSelectedStatus("All Statuses");
                  setSelectedType("All Types");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

    </CorporateLayout>
  );
}
