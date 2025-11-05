/**
 * Old Mutual Brand Icons
 * 
 * Custom icon components using Heroicons aligned with Old Mutual brand guidelines.
 * All icons follow consistent sizing (24px default) and color usage (om-navy, om-green).
 * 
 * Location: /components/icons/index.tsx
 */

"use client";

import React from "react";
import {
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  TruckIcon,
  HomeIcon,
  AcademicCapIcon,
  BeakerIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  UserGroupIcon,
  UserIcon,
  CpuChipIcon,
  CheckCircleIcon,
  StarIcon,
  BellIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  CalculatorIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  HeartIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
} from "@heroicons/react/24/solid";

// Icon mapping for product types
export const ProductIcons = {
  "life-insurance": ShieldCheckIcon,
  "term-life": ShieldCheckIcon,
  "funeral": HeartIcon,
  "whole-life": BuildingOfficeIcon,
  "investment": ChartBarIcon,
  "unit-trusts": ChartBarIcon,
  "retirement": BeakerIcon,
  "education": AcademicCapIcon,
  "vehicle": TruckIcon,
  "property": HomeIcon,
  "business": BuildingOffice2Icon,
  "short-term": BriefcaseIcon,
};

// Status and action icons
export const StatusIcons = {
  active: CheckCircleIcon,
  pending: ClockIcon,
  inactive: XMarkIcon,
  success: CheckCircleIcon,
  error: ExclamationTriangleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

// UI element icons
export const UIIcons = {
  document: DocumentTextIcon,
  policy: ClipboardDocumentListIcon,
  money: BanknotesIcon,
  users: UserGroupIcon,
  user: UserIcon,
  chat: ChatBubbleLeftRightIcon,
  search: MagnifyingGlassIcon,
  filter: FunnelIcon,
  add: PlusIcon,
  close: XMarkIcon,
  next: ChevronRightIcon,
  prev: ChevronLeftIcon,
  arrowRight: ArrowRightIcon,
  arrowLeft: ArrowLeftIcon,
  calendar: CalendarDaysIcon,
  notification: BellIcon,
  star: StarIcon,
  upload: DocumentArrowUpIcon,
};

// Financial icons
export const FinancialIcons = {
  calculator: CalculatorIcon,
  chart: ChartPieIcon,
  trendUp: ArrowTrendingUpIcon,
  trendDown: ArrowTrendingDownIcon,
  payment: CreditCardIcon,
  bank: BuildingStorefrontIcon,
};

// Contact icons
export const ContactIcons = {
  phone: PhoneIcon,
  email: EnvelopeIcon,
  chat: ChatBubbleLeftRightIcon,
};

// Base icon component wrapper
interface IconProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
  size?: number;
  solid?: boolean;
}

export function Icon({ Icon: IconComponent, className = "", size = 24, solid = false }: IconProps) {
  const Component = IconComponent;
  return (
    <Component
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}

// Product Icon Component
interface ProductIconProps {
  type: keyof typeof ProductIcons;
  className?: string;
  size?: number;
}

export function ProductIcon({ type, className = "", size = 24 }: ProductIconProps) {
  const IconComponent = ProductIcons[type] || ShieldCheckIcon;
  const Component = IconComponent;
  return (
    <Component
      className={`text-om-heritage-green ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}

// Status Icon Component
interface StatusIconProps {
  status: keyof typeof StatusIcons;
  className?: string;
  size?: number;
}

export function StatusIcon({ status, className = "", size = 24 }: StatusIconProps) {
  const IconComponent = StatusIcons[status] || InformationCircleIcon;
  const Component = IconComponent;
  const colorClass = 
    status === "active" || status === "success" ? "text-om-heritage-green" :
    status === "pending" || status === "warning" ? "text-om-naartjie" :
    status === "error" ? "text-om-cerise" :
    "text-om-grey-60";
  
  return (
    <Component
      className={`${colorClass} ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}

// Export all icons for direct use
export {
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  TruckIcon,
  HomeIcon,
  AcademicCapIcon,
  BeakerIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  UserGroupIcon,
  UserIcon,
  CpuChipIcon,
  CheckCircleIcon,
  StarIcon,
  BellIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  CalculatorIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  HeartIcon,
  LightBulbIcon,
};

