// lib/types/database.ts
// Comprehensive TypeScript type definitions for database entities
// Purpose: Replace 'any' types with proper type definitions for type safety

// Customer Types
export interface Customer {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_primary: string | null;
  phone_secondary: string | null;
  date_of_birth: Date | string | null;
  address_street: string | null;
  address_city: string | null;
  address_region: string | null;
  address_postal_code: string | null;
  occupation: string | null;
  employer: string | null;
  monthly_income: number | null;
  marital_status: string | null;
  dependents_count: number | null;
  risk_profile: string | null;
  digital_adoption_level: string | null;
  preferred_language: string | null;
  preferred_contact_method: string | null;
  segment: string | null;
  lifetime_value: number | null;
  engagement_score: number | null;
  churn_risk: string | null;
  primary_advisor_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface CustomerRow {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_primary: string | null;
  phone_secondary: string | null;
  date_of_birth: Date | string | null;
  national_id: string | null;
  address_street: string | null;
  address_city: string | null;
  address_region: string | null;
  address_postal_code: string | null;
  occupation: string | null;
  employer: string | null;
  monthly_income: number | string | null;
  marital_status: string | null;
  dependents_count: number | null;
  risk_profile: string | null;
  segment: string | null;
  digital_adoption_level: string | null;
  preferred_language: string | null;
  preferred_contact_method: string | null;
  engagement_score: number | string | null;
  lifetime_value: number | string | null;
  churn_risk: string | null;
  primary_advisor_id: string | null;
}

// Advisor Types
export interface Advisor {
  id: string;
  advisor_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  experience_years: number | null;
  region: string | null;
  branch: string | null;
  active_clients: number | null;
  monthly_target: number | null;
  monthly_sales: number | null;
  conversion_rate: number | null;
  satisfaction_score: number | null;
  performance_rating: string | null;
  commission_rate: number | null;
  avatar_url: string | null;
  manager_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface AdvisorRow {
  id: string;
  advisor_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  experience_years: number | null;
  region: string | null;
  branch: string | null;
  active_clients: number | null;
  monthly_target: number | string | null;
  monthly_sales: number | string | null;
  conversion_rate: number | string | null;
  satisfaction_score: number | string | null;
  performance_rating: string | null;
  commission_rate: number | string | null;
  avatar_url: string | null;
  manager_id: string | null;
}

// Policy Types
export interface Policy {
  id: string;
  policy_number: string;
  customer_id: string;
  product_type: string;
  product_subtype: string | null;
  status: string;
  coverage_amount: number | null;
  premium_amount: number | null;
  premium_frequency: string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
  renewal_date: Date | string | null;
  sum_assured: number | null;
  beneficiaries: Beneficiary[] | null;
  underwriting_class: string | null;
  payment_method: string | null;
  payment_status: string | null;
  commission_amount: number | null;
  advisor_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface Beneficiary {
  name: string;
  relationship: string;
  percentage: number;
}

export interface PolicyRow {
  id: string;
  policy_number: string;
  customer_id: string;
  product_type: string;
  product_subtype: string | null;
  status: string;
  coverage_amount: number | string | null;
  premium_amount: number | string | null;
  premium_frequency: string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
  renewal_date: Date | string | null;
  sum_assured: number | string | null;
  beneficiaries: Beneficiary[] | null;
  underwriting_class: string | null;
  payment_method: string | null;
  payment_status: string | null;
  commission_amount: number | string | null;
  advisor_id: string | null;
  created_at: Date | string;
  updated_at?: Date | string;
}

// Claim Types
export interface Claim {
  id: string;
  claim_number: string;
  policy_id: string;
  customer_id: string;
  claim_type: string;
  status: string;
  incident_date: Date | string | null;
  reported_date: Date | string | null;
  approved_amount: number | null;
  paid_amount: number | null;
  processing_time_days: number | null;
  assessor_id: string | null;
  documents: ClaimDocument[] | null;
  cause_of_loss: string | null;
  reserve_amount: number | null;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface ClaimDocument {
  type: string;
  status: string;
}

export interface ClaimRow {
  id: string;
  claim_number: string;
  policy_id: string;
  customer_id: string;
  claim_type: string;
  status: string;
  incident_date: Date | string | null;
  reported_date: Date | string | null;
  approved_amount: number | string | null;
  paid_amount: number | string | null;
  processing_time_days: number | null;
  assessor_id: string | null;
  documents: ClaimDocument[] | null;
  cause_of_loss: string | null;
  reserve_amount: number | string | null;
  created_at: Date | string;
}

// Task Types
export interface Task {
  id: string;
  task_number: string;
  title: string;
  description: string | null;
  customer_id: string | null;
  advisor_id: string;
  task_type: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Completed" | "Cancelled";
  due_date: Date | string | null;
  completed_date: Date | string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface TaskRow {
  id: string;
  task_number: string;
  advisor_id: string;
  customer_id: string | null;
  customer_number: string | null;
  customer_name: string | null;
  task_type: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: Date | string | null;
  completed_date: Date | string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_at: Date | string;
}

// Communication Types
export interface Communication {
  id: string;
  communication_number: string;
  customer_id: string;
  advisor_id: string | null;
  type: string;
  subject: string | null;
  content: string;
  status: string;
  sent_at: Date | string | null;
  delivered_at: Date | string | null;
  read_at: Date | string | null;
  template_id: string | null;
  created_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface CommunicationRow {
  id: string;
  communication_number: string;
  customer_id: string;
  advisor_id: string | null;
  customer_name: string | null;
  customer_number: string | null;
  type: string;
  subject: string | null;
  content: string;
  status: string;
  sent_at: Date | string | null;
  delivered_at: Date | string | null;
  read_at: Date | string | null;
  template_id: string | null;
  created_at: Date | string;
}

// Template Types
export interface Template {
  id: string;
  template_number: string;
  name: string;
  category: string;
  content: string;
  advisor_id: string | null;
  is_global: boolean;
  usage_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface TemplateRow {
  id: string;
  template_number: string;
  name: string;
  category: string;
  content: string;
  advisor_id: string | null;
  is_global: boolean;
  usage_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

// Document Types
export interface DocumentFile {
  id: string;
  document_number: string;
  title: string;
  filename: string;
  file_path: string;
  original_url: string | null;
  file_size_bytes: number | null;
  content_type: string;
  category: string | null;
  subcategory: string | null;
  document_type: string | null;
  description: string | null;
  tags: string[] | null;
  download_count: number;
  view_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: Record<string, unknown>;
}

export interface DocumentFileRow {
  id: string;
  document_number: string;
  title: string;
  filename: string;
  file_path: string;
  original_url: string | null;
  file_size_bytes: number | null;
  content_type: string;
  category: string | null;
  subcategory: string | null;
  document_type: string | null;
  description: string | null;
  tags: string[] | null;
  download_count: number;
  view_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

// Interaction Types
export interface Interaction {
  id: string;
  interaction_number: string;
  customer_id: string;
  advisor_id: string | null;
  interaction_type: string;
  channel: string;
  direction: string;
  subject: string | null;
  content: string | null;
  sentiment: string | null;
  intent: string | null;
  outcome: string | null;
  duration_minutes: number | null;
  quality_score: number | null;
  follow_up_required: boolean;
  follow_up_date: Date | string | null;
  created_at: Date | string;
  metadata?: Record<string, unknown>;
}

// Analytics Types
export interface CustomerAnalytics {
  id: string;
  customer_id: string;
  date: Date | string;
  lifetime_value: number | null;
  engagement_score: number | null;
  interaction_count_30d: number | null;
  policy_count: number | null;
  total_premium: number | null;
  churn_probability: number | null;
  next_best_product: string | null;
  segment: string | null;
  created_at: Date | string;
}

export interface AdvisorPerformance {
  id: string;
  advisor_id: string;
  date: Date | string;
  clients_served: number | null;
  new_sales: number | null;
  renewals: number | null;
  tasks_completed: number | null;
  tasks_overdue: number | null;
  avg_response_time_hours: number | null;
  customer_satisfaction: number | null;
  conversion_rate: number | null;
  created_at: Date | string;
}

export interface AdvisorSummary {
  id: string;
  advisor_id: string;
  total_clients: number | null;
  active_policies: number | null;
  total_premium_value: number | null;
  average_client_lifetime_value: number | null;
  top_segment: string | null;
  conversion_rate: number | null;
  client_satisfaction_score: number | null;
  last_updated: Date | string;
}

export interface CustomerSummary {
  id: string;
  customer_id: string;
  total_policies: number | null;
  active_policies: number | null;
  total_coverage_value: number | null;
  total_premium_paid: number | null;
  total_claims: number | null;
  lifetime_value: number | null;
  engagement_score: number | null;
  churn_risk: string | null;
  primary_segment: string | null;
  last_updated: Date | string;
}

// API Response Types
export interface ApiError {
  error: string;
  message: string;
  stack?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

// User Uploaded Document Types
export interface UserUploadedDocument {
  id: string;
  documentNumber: string;
  customerId?: string;
  advisorId?: string;
  conversationId?: string;
  claimId?: string;
  originalFilename: string;
  fileBase64?: string;
  fileSizeBytes?: number;
  contentType: string;
  category?: string;
  documentType?: string;
  extractedText: string;
  textPreview: string;
  summary?: string;
  keyPoints?: string[];
  processingStatus: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserUploadedDocumentRow {
  id: string;
  document_number: string;
  customer_id: string | null;
  advisor_id: string | null;
  conversation_id: string | null;
  claim_id: string | null;
  original_filename: string;
  file_base64: string | null;
  file_size_bytes: number | null;
  content_type: string;
  category: string | null;
  document_type: string | null;
  extracted_text: string;
  text_preview: string;
  processing_status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
  updated_at: Date | string;
}

// Helper type for Neon SQL client
export type NeonClient = ReturnType<
  typeof import("@neondatabase/serverless").neon
>;
