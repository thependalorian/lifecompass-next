// lib/utils/pii-mask.ts
// PII (Personally Identifiable Information) Masking Utilities
// Purpose: Mask sensitive data for demo/hackathon purposes while maintaining realistic UX
// For production, implement stricter masking based on user roles and permissions

/**
 * Mask email address - shows first character and domain
 * Example: john.doe@example.com -> j***@example.com
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email; // Invalid email format, return as-is

  const firstChar = localPart[0];
  return `${firstChar}***@${domain}`;
}

/**
 * Mask phone number - shows country code and last 4 digits
 * Example: +264 81 123 4567 -> +264 *** *** 4567
 */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except +
  const digits = phone.replace(/[^\d+]/g, "");

  // If has country code (starts with +)
  if (digits.startsWith("+")) {
    const countryCode = digits.match(/^\+\d{1,3}/)?.[0] || "+264";
    const remaining = digits.slice(countryCode.length);
    if (remaining.length >= 4) {
      const last4 = remaining.slice(-4);
      return `${countryCode} *** *** ${last4}`;
    }
    return `${countryCode} *** ***`;
  }

  // No country code, show last 4 digits
  if (digits.length >= 4) {
    const last4 = digits.slice(-4);
    return `*** *** ${last4}`;
  }

  return "*** ***";
}

/**
 * Mask date of birth - returns age or year only (not full date)
 * Example: 1985-03-15 -> "Age 39" or "1985"
 */
export function maskDateOfBirth(
  dateOfBirth: string | Date | null | undefined,
  format: "age" | "year" = "age",
): string | null {
  if (!dateOfBirth) return null;

  const date =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(date.getTime())) return null;

  if (format === "year") {
    return date.getFullYear().toString();
  }

  // Calculate age
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return `Age ${age}`;
}

/**
 * Mask address - shows only city and region, not street address
 * Example: "123 Main St, Windhoek, Khomas" -> "Windhoek, Khomas"
 */
export function maskAddress(
  street: string | null | undefined,
  city: string | null | undefined,
  region: string | null | undefined,
): string | null {
  const parts = [city, region].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Mask national ID - never expose, always return null or masked value
 * For demo: return null (not exposed)
 * For production: implement role-based access control
 */
export function maskNationalId(nationalId: string | null | undefined): null {
  // Never expose national ID in API responses
  return null;
}

/**
 * Mask income - round to nearest 1000 or show range
 * Example: 12500 -> "N$12,000" or "N$10,000 - N$15,000"
 */
export function maskIncome(
  income: number | null | undefined,
  format: "rounded" | "range" = "rounded",
): string | null {
  if (income === null || income === undefined) return null;

  if (format === "range") {
    const lower = Math.floor(income / 5000) * 5000;
    const upper = lower + 5000;
    return `N$${lower.toLocaleString()} - N$${upper.toLocaleString()}`;
  }

  // Round to nearest 1000
  const rounded = Math.round(income / 1000) * 1000;
  return `N$${rounded.toLocaleString()}`;
}

/**
 * Mask name - show first name and last initial only
 * Example: "John Doe" -> "John D."
 */
export function maskName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName || "";
  const last = lastName ? `${lastName[0]}.` : "";
  return `${first} ${last}`.trim();
}

/**
 * Full name masking - show first initial and last name
 * Example: "John Doe" -> "J. Doe"
 */
export function maskFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName ? `${firstName[0]}.` : "";
  const last = lastName || "";
  return `${first} ${last}`.trim();
}

/**
 * Context-based PII masking
 * Different masking levels based on use case:
 * - 'public': Maximum masking (for public-facing APIs)
 * - 'advisor': Moderate masking (for advisor view)
 * - 'customer': Minimal masking (for customer's own data)
 * - 'admin': No masking (for admin/internal use - requires authentication)
 */
export type MaskingLevel = "public" | "advisor" | "customer" | "admin";

export interface PIIMaskingOptions {
  level: MaskingLevel;
  maskEmail?: boolean;
  maskPhone?: boolean;
  maskAddress?: boolean;
  maskDateOfBirth?: boolean;
  maskIncome?: boolean;
  maskName?: boolean;
}

/**
 * Apply PII masking to customer data based on context
 */
export function maskCustomerPII(
  customer: any,
  options: PIIMaskingOptions,
): any {
  const {
    level,
    maskEmail: shouldMaskEmail = true,
    maskPhone: shouldMaskPhone = true,
    maskAddress: shouldMaskAddress = true,
    maskDateOfBirth: shouldMaskDateOfBirth = true,
    maskIncome: shouldMaskIncome = true,
    maskName: shouldMaskName = false, // Names usually OK for demo
  } = options;

  const masked = { ...customer };

  // Admin level: no masking (but should require authentication in production)
  if (level === "admin") {
    return masked;
  }

  // Public level: maximum masking
  if (level === "public") {
    masked.email = shouldMaskEmail ? maskEmail(customer.email) : customer.email;
    masked.phone = shouldMaskPhone
      ? maskPhone(customer.phone || customer.phone_primary)
      : customer.phone;
    masked.phoneSecondary = shouldMaskPhone
      ? maskPhone(customer.phoneSecondary || customer.phone_secondary)
      : customer.phoneSecondary;
    masked.dateOfBirth = shouldMaskDateOfBirth
      ? maskDateOfBirth(customer.dateOfBirth || customer.date_of_birth)
      : customer.dateOfBirth;
    masked.address = shouldMaskAddress
      ? maskAddress(customer.address, customer.city, customer.region)
      : customer.address;
    masked.monthlyIncome = shouldMaskIncome
      ? maskIncome(customer.monthlyIncome || customer.monthly_income)
      : customer.monthlyIncome;
    masked.nationalId = maskNationalId(
      customer.nationalId || customer.national_id,
    );
    if (shouldMaskName) {
      masked.name = maskName(
        customer.firstName || customer.first_name,
        customer.lastName || customer.last_name,
      );
      masked.firstName = customer.firstName || customer.first_name;
      masked.lastName = customer.lastName
        ? `${customer.lastName[0]}.`
        : customer.lastName;
    }
    return masked;
  }

  // Advisor level: moderate masking (hide sensitive but show useful info)
  // Advisors can see full customer names, but other PII is masked
  if (level === "advisor") {
    // Names are NOT masked for advisors - they can see full names
    // Customer number is still available for verification
    const customerNumber = customer.customerNumber || customer.customer_number;
    if (customerNumber && !masked.name) {
      // Keep full name, but ensure customer number is available
      masked.customerNumber = customerNumber;
    }

    // Mask other sensitive data
    masked.email = shouldMaskEmail ? maskEmail(customer.email) : customer.email;
    masked.phone = shouldMaskPhone
      ? maskPhone(customer.phone || customer.phone_primary)
      : customer.phone;
    masked.phoneSecondary = shouldMaskPhone
      ? maskPhone(customer.phoneSecondary || customer.phone_secondary)
      : customer.phoneSecondary;
    masked.dateOfBirth = shouldMaskDateOfBirth
      ? maskDateOfBirth(customer.dateOfBirth || customer.date_of_birth, "age")
      : null; // Never show full DOB to advisors
    masked.address = shouldMaskAddress
      ? maskAddress(customer.address, customer.city, customer.region)
      : customer.address;
    masked.monthlyIncome = shouldMaskIncome
      ? maskIncome(customer.monthlyIncome || customer.monthly_income, "range")
      : customer.monthlyIncome;
    masked.nationalId = maskNationalId(
      customer.nationalId || customer.national_id,
    ); // Always null
    return masked;
  }

  // Customer level: minimal masking (customer viewing own data)
  if (level === "customer") {
    // Customer can see their own full data, but still mask national ID
    masked.nationalId = maskNationalId(
      customer.nationalId || customer.national_id,
    );
    return masked;
  }

  return masked;
}

/**
 * Apply PII masking to advisor data
 */
export function maskAdvisorPII(advisor: any, options: PIIMaskingOptions): any {
  const {
    level,
    maskEmail: shouldMaskEmail = true,
    maskPhone: shouldMaskPhone = true,
  } = options;

  const masked = { ...advisor };

  if (level === "admin") {
    return masked;
  }

  if (level === "public" || level === "advisor") {
    masked.email = shouldMaskEmail ? maskEmail(advisor.email) : advisor.email;
    masked.phone = shouldMaskPhone ? maskPhone(advisor.phone) : advisor.phone;
  }

  return masked;
}
