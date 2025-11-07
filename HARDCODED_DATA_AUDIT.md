# Hardcoded Data Audit Report
## Pages Using Hardcoded Data Instead of Database/API

**Date:** 2025-01-XX  
**Status:** 🔴 Multiple pages still using hardcoded data

---

## 🔴 Critical: Pages with Hardcoded Data

### 1. **Advisors Listing Page** (`app/advisors/page.tsx`)
**Issue:** Hardcoded array of 20 advisors
- **Location:** Lines 12-277
- **Data:** `const advisors = [...]` (20 hardcoded advisor objects)
- **Should Use:** `/api/advisors` endpoint (✅ EXISTS)
- **Impact:** Shows only 20 hardcoded advisors instead of all advisors from database
- **Fix:** Replace with `useEffect` fetching from `/api/advisors`

---

### 2. **Advisor Profile Page** (`app/advisors/[id]/page.tsx`)
**Issue:** Hardcoded advisor data, reviews, education, achievements
- **Location:** Lines 15-56
- **Data:** 
  - `advisorData` object (hardcoded)
  - `reviews` array (hardcoded)
  - `education` array (hardcoded)
  - `achievements` array (hardcoded)
- **Should Use:** `/api/advisors/[id]` endpoint (✅ EXISTS)
- **Impact:** Shows same advisor data regardless of ID, missing real reviews/education
- **Fix:** Fetch advisor data from API using `[id]` parameter

---

### 3. **Products Page** (`app/products/page.tsx`)
**Issue:** Hardcoded products array
- **Location:** Lines 148-230+
- **Data:** `const products = [...]` (hardcoded product categories and items)
- **Should Use:** `/api/documents` for product PDFs (✅ EXISTS) OR create `/api/products` endpoint
- **Impact:** Shows static product list instead of dynamic product catalog
- **Fix:** Either fetch from documents API or create products API endpoint

---

### 4. **Advisor Insights Page** (`app/advisor/insights/page.tsx`)
**Issue:** Multiple hardcoded data arrays
- **Location:** 
  - Lines 25-42: `performanceData` (hardcoded)
  - Lines 44-49: `topProducts` (hardcoded)
  - Lines 51-56: `clientSegments` (hardcoded)
- **Should Use:** 
  - `/api/advisors/[id]/dashboard` for performance data (✅ EXISTS)
  - Calculate `topProducts` from policies data
  - Calculate `clientSegments` from actual client data (✅ PARTIALLY FIXED - fetches clients but segments still hardcoded)
- **Impact:** Shows static performance metrics instead of real advisor performance
- **Fix:** Fetch performance data from API and calculate segments from real client data

---

### 5. **Advisor Communication Center** (`app/advisor/communicate/page.tsx`)
**Issue:** Hardcoded messages and templates
- **Location:** 
  - Lines 10-44: `messages` array (hardcoded)
  - Lines 46-68: `templates` array (hardcoded)
- **Should Use:** 
  - `/api/communications?advisorId=...` endpoint (needs to be created)
  - `/api/templates` endpoint (needs to be created)
- **Impact:** Shows only 3 hardcoded messages instead of real communications from database
- **Database Has:** `communications` table with 890 communications
- **Fix:** Create API endpoints and fetch real communications

---

### 6. **Advisor Knowledge Base** (`app/advisor/knowledge/page.tsx`)
**Issue:** Hardcoded knowledge categories, articles, and searches
- **Location:** 
  - Lines 11-48: `knowledgeCategories` (hardcoded)
  - Lines 50-96: `recentArticles` (hardcoded)
  - Lines 98-107: `popularSearches` (hardcoded)
- **Should Use:** 
  - `/api/documents` for document categories (✅ EXISTS)
  - `/api/knowledge` for articles (✅ EXISTS but may need enhancement)
- **Impact:** Shows static categories and articles instead of real document data
- **Database Has:** `document_files` table with 49 PDF documents
- **Fix:** Fetch from documents/knowledge API and calculate categories dynamically

---

## ✅ Pages Already Using API (Correctly)

1. **Customer Selection** (`app/customer/select/page.tsx`) - ✅ Uses `/api/customers`
2. **Advisor Selection** (`app/advisor/select/page.tsx`) - ✅ Uses `/api/advisors`
3. **Customer Profile** (`app/customer/profile/[id]/page.tsx`) - ✅ Uses `/api/customers?number=...`
4. **Advisor Profile** (`app/advisor/profile/[id]/page.tsx`) - ✅ Uses `/api/advisors?number=...`
5. **Advisor Dashboard** (`app/advisor/page.tsx`) - ✅ Uses `/api/advisors/[id]/dashboard`
6. **Advisor Clients** (`app/advisor/clients/page.tsx`) - ✅ Uses `/api/advisors/[id]/clients`
7. **Advisor Tasks** (`app/advisor/tasks/page.tsx`) - ✅ Uses `/api/tasks?advisorId=...`
8. **Advisor Client 360°** (`app/advisor/client/[id]/page.tsx`) - ✅ Uses `/api/customers` and `/api/policies`
9. **Claims Page** (`app/claims/page.tsx`) - ✅ Uses `/api/claims?customerNumber=...`
10. **Policies Page** (`app/policies/page.tsx`) - ✅ Uses `/api/policies?customerNumber=...`
11. **Book Consultation** (`app/advisors/[id]/book/page.tsx`) - ✅ Uses `/api/advisors/[id]` (FIXED)
12. **Cross-Sell Opportunities** (`app/advisor/insights/page.tsx`) - ✅ Uses `/api/advisors/[id]/cross-sell` (FIXED)

---

## 📋 Summary

### Pages Needing Fixes:
1. ✅ `app/advisors/[id]/book/page.tsx` - **FIXED** (now fetches advisor from API)
2. ✅ `app/advisors/page.tsx` - **FIXED** (now fetches all advisors from `/api/advisors`)
3. ✅ `app/advisors/[id]/page.tsx` - **FIXED** (now fetches advisor profile from API)
4. ✅ `app/advisor/communicate/page.tsx` - **FIXED** (now fetches communications and templates from API, with toast notifications)
5. ✅ `app/advisor/knowledge/page.tsx` - **FIXED** (now fetches documents and calculates categories/articles from API)
6. ✅ `app/advisor/insights/page.tsx` - **FIXED** (now calculates segments, topProducts, and fetches performanceData from API)
7. ⚠️ `app/products/page.tsx` - **PARTIALLY FIXED** (products are informational/marketing content, not database records; already fetches documents for product guides)

### API Endpoints Status:
1. ✅ `/api/advisors` - Returns all advisors (USED by advisors listing page)
2. ✅ `/api/advisors?number=...` - Returns single advisor by number (USED by advisor profile page)
3. ✅ `/api/advisors/[id]/dashboard` - Returns advisor dashboard stats (USED by insights page)
4. ✅ `/api/advisors/[id]/clients` - Returns advisor's clients (USED by insights and communicate pages)
5. ✅ `/api/advisors/[id]/cross-sell` - Returns cross-sell opportunities (USED by insights page)
6. ✅ `/api/communications` - Returns and creates communications (CREATED and USED by communicate page)
7. ✅ `/api/templates` - Returns message templates (CREATED and USED by communicate page)
8. ✅ `/api/documents` - Returns document files (USED by knowledge and products pages)
9. ✅ `/api/knowledge` - Returns knowledge base data (USED by knowledge page)
10. ✅ `/api/policies` - Returns policies (USED by insights page for top products calculation)

---

## ✅ Completed Fixes

1. ✅ **Toast Notifications:** Installed `react-hot-toast` and added `ToastProvider` to app layout
2. ✅ **Communications API:** Created `/api/communications` endpoint with GET and POST methods
3. ✅ **Templates API:** Created `/api/templates` endpoint for message templates
4. ✅ **Database Functions:** Added `getAdvisorCommunications`, `getCustomerCommunications`, and `createCommunication` to `lib/db/neon.ts`
5. ✅ **Advisors Listing:** `app/advisors/page.tsx` now fetches from `/api/advisors`
6. ✅ **Advisor Profile:** `app/advisors/[id]/page.tsx` now fetches from `/api/advisors?number=...`
7. ✅ **Communicate Page:** `app/advisor/communicate/page.tsx` now fetches communications and templates from API with toast notifications
8. ✅ **Knowledge Page:** `app/advisor/knowledge/page.tsx` now fetches documents and calculates categories/articles dynamically
9. ✅ **Insights Page:** `app/advisor/insights/page.tsx` now calculates segments from real client data, fetches performance data from dashboard API, and calculates top products from policies

## 📝 Notes

- **Products Page:** Products are informational/marketing content rather than database records. The page already fetches related documents from `/api/documents` for product guides. This is acceptable as products are typically static marketing content.
- **Toast Notifications:** All new API interactions now include toast notifications for success/error feedback using `react-hot-toast`.

