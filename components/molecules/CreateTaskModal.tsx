/**
 * Create Task Modal Component
 * Location: /components/molecules/CreateTaskModal.tsx
 * Purpose: Modal dialog for creating new tasks
 */

"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisorId: string;
  onTaskCreated: () => void;
  customers?: Array<{ id: string; customerNumber: string; name: string }>;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  advisorId,
  onTaskCreated,
  customers = [],
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "Follow-up",
    priority: "Medium",
    status: "Open",
    dueDate: "",
    customerId: "",
    estimatedHours: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        taskType: "Follow-up",
        priority: "Medium",
        status: "Open",
        dueDate: "",
        customerId: "",
        estimatedHours: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advisorId,
          title: formData.title,
          description: formData.description || undefined,
          taskType: formData.taskType,
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate || undefined,
          customerId: formData.customerId || undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      // Success - close modal and refresh tasks
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const taskTypes = [
    "Follow-up",
    "Escalation",
    "Review",
    "Sale",
    "Onboarding",
    "Renewal",
    "Claim Processing",
    "Investment Review",
    "Product Quote",
    "Business Consultation",
    "Policy Renewal",
    "New Application",
  ];

  const priorities = ["Low", "Medium", "High", "Urgent"];
  const statuses = ["Open", "In Progress"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-om-grey-15">
          <h2 className="text-2xl font-bold text-om-navy">Create New Task</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Task Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-om w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Follow up with customer on policy renewal"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered input-om w-full"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Additional details about the task..."
            />
          </div>

          {/* Task Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Task Type *</span>
              </label>
              <select
                className="select select-bordered input-om w-full"
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                required
              >
                {taskTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Priority *</span>
              </label>
              <select
                className="select select-bordered input-om w-full"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                required
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Status</span>
              </label>
              <select
                className="select select-bordered input-om w-full"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Due Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-om w-full"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Customer and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Customer (Optional)</span>
              </label>
              <select
                className="select select-bordered input-om w-full"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">No customer assigned</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customerNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Estimated Hours</span>
              </label>
              <input
                type="number"
                className="input input-bordered input-om w-full"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                min="0"
                step="0.5"
                placeholder="e.g., 2.5"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-om-grey-15">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-om-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-om-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

