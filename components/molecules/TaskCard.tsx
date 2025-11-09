/**
 * Task Card Component
 * Location: /components/molecules/TaskCard.tsx
 * Purpose: Task display per PRD requirements
 * PRD: Task type icon, priority badge, customer name, due date, status dropdown
 */

"use client";

import { ReactNode } from "react";
import { OMButton } from "@/components/atoms/brand";
import {
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface TaskCardProps {
  taskNumber: string;
  taskType: string;
  priority: "low" | "medium" | "high" | "urgent";
  customerName: string;
  description: string;
  dueDate: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  icon?: ReactNode;
  onViewContext?: () => void;
  onMarkComplete?: () => void;
  onReassign?: () => void;
}

export function TaskCard({
  taskNumber,
  taskType,
  priority,
  customerName,
  description,
  dueDate,
  status,
  icon,
  onViewContext,
  onMarkComplete,
  onReassign,
}: TaskCardProps) {
  const priorityConfig = {
    urgent: { color: "bg-om-cerise", text: "Urgent" },
    high: { color: "bg-om-naartjie", text: "High" },
    medium: { color: "bg-om-sun", text: "Medium" },
    low: { color: "bg-om-grey-40", text: "Low" },
  };

  const statusConfig = {
    open: { color: "bg-om-sky", text: "Open" },
    in_progress: { color: "bg-om-sun", text: "In Progress" },
    completed: { color: "bg-om-fresh-green", text: "Completed" },
    cancelled: { color: "bg-om-grey-40", text: "Cancelled" },
  };

  const priorityInfo = priorityConfig[priority];
  const statusInfo = statusConfig[status];

  return (
    <div className="card-om p-5 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="w-10 h-10 text-om-heritage-green">{icon}</div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-om-heritage-green/10 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-om-heritage-green" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-om-navy">{taskType}</h3>
            <p className="text-xs text-om-grey-60">{taskNumber}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span
            className={`badge text-xs px-2 py-1 ${priorityInfo.color} text-white`}
          >
            {priorityInfo.text}
          </span>
          <span
            className={`badge text-xs px-2 py-1 ${statusInfo.color} text-white`}
          >
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-2 mb-3">
        <UserIcon className="w-4 h-4 text-om-grey-60" />
        <span className="text-sm font-medium text-om-navy">{customerName}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-om-grey-80 mb-3">{description}</p>

      {/* Due Date */}
      <div className="flex items-center gap-2 text-xs text-om-grey-60 mb-4">
        <ClockIcon className="w-4 h-4" />
        <span>Due: {dueDate}</span>
      </div>

      {/* Actions */}
      {status !== "completed" && status !== "cancelled" && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-om-grey-15">
          {onViewContext && (
            <OMButton
              variant="outline"
              size="sm"
              onClick={onViewContext}
              className="rounded-full flex-1"
            >
              View Context
            </OMButton>
          )}
          {onMarkComplete && (
            <OMButton
              variant="primary"
              size="sm"
              onClick={onMarkComplete}
              className="rounded-full"
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Complete
            </OMButton>
          )}
          {onReassign && (
            <OMButton
              variant="ghost"
              size="sm"
              onClick={onReassign}
              className="rounded-full"
            >
              Reassign
            </OMButton>
          )}
        </div>
      )}
    </div>
  );
}
