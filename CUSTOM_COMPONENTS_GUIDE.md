# Custom Components & Layouts Guide

## Overview

LifeCompass uses **custom layouts and components** instead of generic DaisyUI templates. All components follow the PRD requirements and Old Mutual brand guidelines.

## Custom Layouts

### CustomerPageLayout
**Location:** `/components/templates/CustomerPageLayout.tsx`

**Purpose:** Unified layout for all customer self-service pages

**Features:**
- Mobile-optimized hero section
- Automatic Navigation and Footer
- ChatWidget integration
- Custom hero backgrounds with gradient overlays

**Usage:**
```tsx
<CustomerPageLayout
  heroTitle="Page Title"
  heroSubtitle="Page description"
  heroBackground="/path/to/image.jpg"
  showChat={true}
>
  {/* Page content */}
</CustomerPageLayout>
```

### AdvisorPageLayout
**Location:** `/components/templates/AdvisorPageLayout.tsx`

**Purpose:** Unified layout for all advisor command center pages

**Features:**
- Desktop-first header with actions
- Professional gradient header
- Automatic Navigation and Footer
- ChatWidget integration

**Usage:**
```tsx
<AdvisorPageLayout
  headerTitle="Page Title"
  headerSubtitle="Welcome message"
  headerActions={<select>...</select>}
  showChat={true}
>
  {/* Page content */}
</AdvisorPageLayout>
```

## Custom Components (Molecules)

### CustomerProfileCard
**Location:** `/components/molecules/CustomerProfileCard.tsx`

**PRD Requirements:**
- Avatar, full name, preferred name, contact info
- KYC badge, "Last active" timestamp
- Quick actions: "Message", "View Policies", "Schedule Meeting"

**Usage:**
```tsx
<CustomerProfileCard
  name="Maria Shikongo"
  preferredName="Maria"
  email="maria@example.com"
  phone="+264 81 123 4567"
  kycStatus="verified"
  lastActive="2 hours ago"
  quickActions={[
    { label: "View Policies", onClick: () => {} },
    { label: "Schedule Meeting", onClick: () => {} }
  ]}
/>
```

### PolicySummaryTile
**Location:** `/components/molecules/PolicySummaryTile.tsx`

**PRD Requirements:**
- Policy type icon, policy number, status badge
- Premium amount, next review date
- Quick actions: "View Details", "Download Statement", "Request Change"

**Usage:**
```tsx
<PolicySummaryTile
  policyNumber="POL-2024-001"
  productType="Funeral Insurance"
  status="active"
  premiumAmount={250}
  premiumFrequency="monthly"
  nextReviewDate="2025-03-15"
  coverageAmount={50000}
  onViewDetails={() => {}}
  onDownloadStatement={() => {}}
  onRequestChange={() => {}}
/>
```

### QuickActionButtons
**Location:** `/components/molecules/QuickActionButtons.tsx`

**PRD Requirements:**
- "Request Adviser Consultation"
- "Download Document"
- "Raise Claim"
- "Schedule Review"
- "Chat with LifeCompass"

**Usage:**
```tsx
<QuickActionButtons
  actions={[
    { label: "Chat with LifeCompass", href: "/chat", variant: "primary" },
    { label: "Find an Advisor", href: "/advisors", variant: "outline" }
  ]}
  layout="horizontal"
/>
```

### TaskCard
**Location:** `/components/molecules/TaskCard.tsx`

**PRD Requirements:**
- Task type icon, priority badge, customer name
- Due date, status dropdown
- Actions: "View Context", "Mark Complete", "Reassign"

**Usage:**
```tsx
<TaskCard
  taskNumber="TASK-001"
  taskType="Escalation"
  priority="high"
  customerName="Maria Shikongo"
  description="Education savings inquiry"
  dueDate="Today, 2:00 PM"
  status="open"
  onViewContext={() => {}}
  onMarkComplete={() => {}}
  onReassign={() => {}}
/>
```

## Custom Icons

**Location:** `/components/atoms/icons/CustomIcons.tsx`

**Icons Available:**
- `BriefcaseIcon` - For business/work-related content
- `ClockIcon` - For time-sensitive content
- `CompassIcon` - LifeCompass branding
- `TargetIcon` - Goals and targets

**Usage:**
```tsx
import { BriefcaseIcon, ClockIcon } from "@/components/atoms/icons/CustomIcons";

<BriefcaseIcon className="w-6 h-6 text-om-heritage-green" />
```

## DeepSeek Integration

**Status:** ✅ Already Configured

The LifeCompass assistant uses **DeepSeek** as the primary LLM provider:

**Configuration:**
- **Provider:** `DeepSeekProvider` in `/lib/agent/providers.ts`
- **API:** Uses DeepSeek-compatible OpenAI API
- **Model:** `deepseek-chat` (configurable via `DEEPSEEK_MODEL` env var)
- **System Prompts:** Specialized prompts in `/lib/agent/prompts.ts`

**Key Files:**
- `/lib/agent/providers.ts` - DeepSeek provider implementation
- `/lib/agent/index.ts` - Agent orchestration using DeepSeek
- `/lib/agent/prompts.ts` - CUSTOMER_SYSTEM_PROMPT, ADVISER_SYSTEM_PROMPT
- `/app/api/chat/route.ts` - Chat API endpoint
- `/app/api/chat/stream/route.ts` - Streaming chat endpoint

**Environment Variables:**
```env
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_BASE_URL="https://api.deepseek.com/v1"
DEEPSEEK_MODEL="deepseek-chat"
```

## Component Usage Examples

### Customer Pages
All customer pages should use `CustomerPageLayout`:

```tsx
// app/products/page.tsx
import { CustomerPageLayout } from "@/components/templates/CustomerPageLayout";

export default function ProductsPage() {
  return (
    <CustomerPageLayout
      heroTitle="Our Products"
      heroSubtitle="Explore comprehensive financial solutions"
      heroBackground="/image.jpg"
    >
      {/* Page content */}
    </CustomerPageLayout>
  );
}
```

### Advisor Pages
All advisor pages should use `AdvisorPageLayout`:

```tsx
// app/advisor/clients/page.tsx
import { AdvisorPageLayout } from "@/components/templates/AdvisorPageLayout";

export default function AdvisorClientsPage() {
  return (
    <AdvisorPageLayout
      headerTitle="Client Management"
      headerSubtitle="Search, segment, and manage your client book"
    >
      {/* Page content */}
    </AdvisorPageLayout>
  );
}
```

## Brand Compliance

All custom components follow:
- **Old Mutual Brand Colors:** Heritage Green (#009677), Fresh Green (#50b848)
- **Typography:** Montserrat, Century Gothic
- **Spacing:** 8px grid system
- **Buttons:** iOS-style rounded (9999px border-radius)
- **Accessibility:** WCAG 2.1 AA compliant

## Next Steps

1. ✅ Custom layouts created
2. ✅ Core molecule components created
3. ✅ Custom icons replacing emojis
4. ✅ DeepSeek integration verified
5. 🔄 Update remaining pages to use custom layouts
6. 🔄 Replace generic components with custom molecules

