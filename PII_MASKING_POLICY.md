# PII (Personally Identifiable Information) Masking Policy

## Overview

This document outlines the PII masking strategy implemented for the LifeCompass platform. PII masking is critical for:

- **Privacy Protection**: Protecting customer and advisor personal information
- **Regulatory Compliance**: Meeting data protection requirements (GDPR, POPIA, etc.)
- **Security**: Reducing risk of data breaches and identity theft
- **Demo/Hackathon Safety**: Safe demonstration without exposing real personal data

## What is PII?

Personally Identifiable Information (PII) includes:

- **National ID Numbers** - Never exposed
- **Email Addresses** - Masked (e.g., `j***@example.com`)
- **Phone Numbers** - Masked (e.g., `+264 *** *** 4567`)
- **Date of Birth** - Converted to age or year only
- **Full Address** - Only city/region shown, not street address
- **Monthly Income** - Rounded or shown as range
- **Full Names** - Can be partially masked based on context

## Masking Levels

### 1. **Public Level** (Maximum Masking)

**Use Case**: Public-facing APIs, demo/hackathon, unauthenticated access

**Masking Applied**:

- ✅ Email: `j***@example.com`
- ✅ Phone: `+264 *** *** 4567`
- ✅ Date of Birth: `Age 39` (not full date)
- ✅ Address: `Windhoek, Khomas` (city/region only)
- ✅ Income: `N$12,000` (rounded to nearest 1000)
- ✅ National ID: `null` (never exposed)

**Example**:

```json
{
  "email": "j***@oldmutual.com.na",
  "phone": "+264 *** *** 4567",
  "dateOfBirth": "Age 39",
  "address": "Windhoek, Khomas",
  "monthlyIncome": "N$12,000",
  "nationalId": null
}
```

### 2. **Advisor Level** (Moderate Masking)

**Use Case**: Advisor viewing client data (authenticated advisor)

**Masking Applied**:

- ✅ Email: `j***@example.com` (partial)
- ✅ Phone: `+264 *** *** 4567` (last 4 digits visible)
- ✅ Date of Birth: `Age 39` (age shown, not full date)
- ✅ Address: `Windhoek, Khomas` (city/region only)
- ✅ Income: `N$10,000 - N$15,000` (range shown)
- ✅ National ID: `null` (never exposed)

**Rationale**: Advisors need some contact info but not full PII for relationship management.

### 3. **Customer Level** (Minimal Masking)

**Use Case**: Customer viewing their own data (authenticated customer)

**Masking Applied**:

- ❌ Email: Full email shown (customer's own data)
- ❌ Phone: Full phone shown (customer's own data)
- ⚠️ Date of Birth: Full date shown (customer's own data)
- ❌ Address: Full address shown (customer's own data)
- ❌ Income: Full amount shown (customer's own data)
- ✅ National ID: `null` (never exposed, even to customer)

**Rationale**: Customers can see their own data, but national ID is never exposed.

### 4. **Admin Level** (No Masking)

**Use Case**: Internal admin/system access (requires strict authentication)

**Masking Applied**:

- ❌ All fields: Full data shown
- ⚠️ National ID: Full ID shown (only for admin/system operations)

**Warning**: Admin level should only be used with:

- Strong authentication (MFA required)
- Audit logging of all access
- Role-based access control (RBAC)
- Regular security audits

## Implementation

### Masking Functions

Located in `/lib/utils/pii-mask.ts`:

- `maskEmail(email)` - Masks email addresses
- `maskPhone(phone)` - Masks phone numbers
- `maskDateOfBirth(date, format)` - Converts to age or year
- `maskAddress(street, city, region)` - Shows city/region only
- `maskNationalId(id)` - Always returns null
- `maskIncome(income, format)` - Rounds or shows range
- `maskCustomerPII(customer, options)` - Applies context-based masking
- `maskAdvisorPII(advisor, options)` - Applies advisor-specific masking

### API Endpoints with PII Masking

1. **`/api/customers`** - Public level masking
2. **`/api/customers?number=...`** - Public level masking
3. **`/api/advisors`** - Public level masking
4. **`/api/advisors?number=...`** - Public level masking
5. **`/api/advisors/[id]/clients`** - Advisor level masking

### Current Implementation Status

✅ **Implemented**:

- PII masking utility functions
- Customer API endpoints masked
- Advisor API endpoints masked
- Advisor clients endpoint masked

⚠️ **To Be Implemented** (for production):

- Authentication-based masking level selection
- Role-based access control (RBAC)
- Audit logging of PII access
- Customer self-service view (customer level masking)
- Admin panel with strict access controls

## Demo/Hackathon Considerations

For the **Old Mutual Tech Innovation Hackathon**, we use **Public Level** masking by default because:

1. No authentication system is implemented
2. All data is demo/seed data (not real PII)
3. Safe for public demonstration
4. Shows realistic data without privacy risks

**Note**: Even with demo data, masking is important to:

- Demonstrate privacy-conscious development
- Show compliance awareness
- Protect against accidental real data exposure
- Establish good security practices

## Production Requirements

For production deployment, implement:

1. **Authentication System**
   - User login/authentication
   - Session management
   - Token-based API access

2. **Authorization System**
   - Role-based access control (RBAC)
   - Permission checks before data access
   - Context-aware masking level selection

3. **Audit Logging**
   - Log all PII access
   - Track who accessed what data and when
   - Compliance reporting

4. **Data Encryption**
   - Encrypt PII at rest (database)
   - Encrypt PII in transit (HTTPS/TLS)
   - Key management system

5. **Access Controls**
   - Principle of least privilege
   - Regular access reviews
   - Automatic access revocation

## Compliance Notes

### GDPR (General Data Protection Regulation)

- ✅ Data minimization (only collect necessary PII)
- ✅ Purpose limitation (use PII only for stated purpose)
- ✅ Storage limitation (retain PII only as long as necessary)
- ✅ Security measures (masking, encryption, access controls)

### POPIA (Protection of Personal Information Act - South Africa/Namibia)

- ✅ Lawful processing (legitimate purpose)
- ✅ Purpose specification (clear purpose for data collection)
- ✅ Information quality (accurate, complete data)
- ✅ Security safeguards (masking, encryption)

## Testing

To test PII masking:

```bash
# Test customer API
curl http://localhost:3000/api/customers?number=CUST-001

# Test advisor API
curl http://localhost:3000/api/advisors?number=ADV-001

# Verify masking applied:
# - Email should be masked: j***@example.com
# - Phone should be masked: +264 *** *** 4567
# - Date of birth should show age, not full date
# - Address should show city/region only
# - National ID should be null
```

## Future Enhancements

1. **Dynamic Masking Levels**: Based on user role and context
2. **Field-Level Permissions**: Granular control per field
3. **Masking Configuration**: Admin-configurable masking rules
4. **Audit Dashboard**: Visualize PII access patterns
5. **Compliance Reports**: Automated compliance reporting

## Questions?

For questions about PII masking implementation, contact the development team or refer to:

- `/lib/utils/pii-mask.ts` - Masking utility functions
- `/app/api/*/route.ts` - API endpoint implementations
- This document - Policy and guidelines
