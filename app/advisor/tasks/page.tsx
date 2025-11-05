// app/advisor/tasks/page.tsx

"use client";

import { useState } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";

const tasks = [
  {
    id: "TSK001",
    title: "Follow-up with Maria Shikongo - OMP Severe Illness Cover",
    client: "Maria Shikongo",
    type: "Product Consultation",
    priority: "High",
    status: "Pending",
    dueDate: "2025-11-15",
    description:
      "Discuss OMP Severe Illness Cover options. Client interested in coverage for 68 severe illnesses with lump sum benefits.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-11-01",
    estimatedTime: "45 min",
  },
  {
    id: "TSK002",
    title: "Process Disability Income Claim for John-Paul !Gaeb",
    client: "John-Paul !Gaeb",
    type: "Claims Processing",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-11-10",
    description:
      "Review OMP Disability Income Cover claim. Client unable to perform material duties of occupation for 6+ months.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-10-28",
    estimatedTime: "60 min",
  },
  {
    id: "TSK003",
    title: "Review Fatima Isaacks Unit Trust Application",
    client: "Fatima Isaacks",
    type: "Investment Review",
    priority: "Medium",
    status: "Pending",
    dueDate: "2025-11-05",
    description:
      "Review Old Mutual Namibia Income Fund application. Client wants regular income with capital stability.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-10-30",
    estimatedTime: "45 min",
  },
  {
    id: "TSK004",
    title: "Funeral Insurance Quote for Helena Garoeb",
    client: "Helena Garoeb",
    type: "Product Quote",
    priority: "Medium",
    status: "Pending",
    dueDate: "2025-11-08",
    description:
      "Provide OMP Funeral Care Comprehensive+ quote (N$80/month, N$50,000 coverage). Client needs extended family coverage.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-10-25",
    estimatedTime: "30 min",
  },
  {
    id: "TSK005",
    title: "Business Unit Trust Consultation - Kazenambo Group",
    client: "Kazenambo Group",
    type: "Business Consultation",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-11-12",
    description:
      "Present business unit trust options for company retirement fund. Minimum N$1,000 lump sum investment.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-10-28",
    estimatedTime: "90 min",
  },
  {
    id: "TSK006",
    title: "KPF Business Life Insurance Renewal",
    client: "Construction Company Ltd",
    type: "Policy Renewal",
    priority: "Medium",
    status: "Pending",
    dueDate: "2025-11-20",
    description:
      "Renew KPF Key Person Insurance policy. Review coverage for business continuity and succession planning.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-11-01",
    estimatedTime: "45 min",
  },
  {
    id: "TSK007",
    title: "OMP Disability Income Cover Application",
    client: "Joseph !Hoebes",
    type: "New Application",
    priority: "High",
    status: "Pending",
    dueDate: "2025-11-15",
    description:
      "Process OMP Disability Income Cover application. Client is self-employed farmer seeking income protection.",
    assignedTo: "Thomas Shikongo",
    createdDate: "2025-11-02",
    estimatedTime: "60 min",
  },
];

const priorities = ["All Priorities", "High", "Medium", "Low"];
const statuses = [
  "All Statuses",
  "Pending",
  "In Progress",
  "Completed",
  "Overdue",
];
const types = [
  "All Types",
  "Product Consultation",
  "Claims Processing",
  "Investment Review",
  "Product Quote",
  "Business Consultation",
  "Policy Renewal",
  "New Application",
];

export default function AdvisorTasksPage() {
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("dueDate");

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
      const matchesPriority =
        selectedPriority === "All Priorities" ||
        task.priority === selectedPriority;
      const matchesStatus =
        selectedStatus === "All Statuses" || task.status === selectedStatus;
      const matchesType =
        selectedType === "All Types" || task.type === selectedType;

      return matchesPriority && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          );
        case "client":
          return a.client.localeCompare(b.client);
        case "createdDate":
          return (
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
          );
        default:
          return 0;
      }
    });

  const pendingTasks = filteredTasks.filter(
    (task) =>
      task.status === "Pending" ||
      task.status === "In Progress" ||
      task.status === "Overdue",
  ).length;
  const overdueTasks = filteredTasks.filter(
    (task) => task.status === "Overdue",
  ).length;
  const completedToday = filteredTasks.filter(
    (task) =>
      task.status === "Completed" &&
      new Date(task.createdDate).toDateString() === new Date().toDateString(),
  ).length;

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
                  {Math.round(
                    (filteredTasks.filter((t) => t.status === "Completed")
                      .length /
                      tasks.length) *
                      100,
                  )}
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

                    <p className="text-om-grey mb-3">{task.description}</p>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-om-grey">Client:</span>
                        <div className="font-semibold text-om-navy">
                          {task.client}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Type:</span>
                        <div className="font-semibold text-om-navy">
                          {task.type}
                        </div>
                      </div>
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
                          {task.dueDate}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Estimated Time:</span>
                        <div className="font-semibold text-om-navy">
                          {task.estimatedTime}
                        </div>
                      </div>
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
