# Database Integration Fixes - Knowledge Base, Products, Dashboard

## Summary
Fixed all issues with knowledge base, products page, and dashboard to ensure they properly fetch and display data from the database.

## ✅ Fixed Issues

### 1. Knowledge Base Page (`/app/advisor/knowledge/page.tsx`)

**Issues Fixed:**
- ❌ "Read Article" button only showed toast, didn't open documents
- ❌ No document listing when category was selected
- ❌ Documents weren't viewable/downloadable

**Fixes Applied:**
- ✅ Added "View PDF" and "Download" buttons that actually open/download documents
- ✅ Added category document listing section that shows when a category is clicked
- ✅ Documents are now fetched from `/api/documents?category=...` when category is selected
- ✅ All documents link to `/api/documents/{documentNumber}/view` and `/api/documents/{documentNumber}/download`
- ✅ Added proper error handling and loading states

**New Features:**
- Category filtering: Click a category to see all documents in that category
- Document cards with view/download buttons
- View count and download count display
- Clear filter button to reset category selection

### 2. Products Page (`/app/products/page.tsx`)

**Issues Fixed:**
- ❌ "View Guide" button not showing even when documents were available
- ❌ Document matching logic was too strict (missed some funeral cover documents)
- ❌ No error handling for failed document fetches

**Fixes Applied:**
- ✅ "View Guide" button now shows conditionally when documents are available
- ✅ Improved document matching logic (better funeral cover matching)
- ✅ Added error handling with toast notifications
- ✅ Added console logging for debugging document loading
- ✅ Documents are properly mapped to products using both document numbers and title keywords

**Document Mapping:**
- `OMP Severe Illness Cover` → DOC-004
- `OMP Funeral Insurance` → DOC-001 (Extended Family Funeral Cover) or DOC-002 (Family Funeral Cover)
- `OMP Disability Income Cover` → DOC-005
- `Unit Trusts` → DOC-024 (Unit Trust Individual Buying Form)

### 3. Dashboard (`/app/api/advisors/[id]/dashboard/route.ts`)

**Status:** ✅ Already fetching from database correctly

**Data Sources:**
- ✅ Advisor stats from `advisors` table (monthly_target, monthly_sales, conversion_rate, satisfaction_score)
- ✅ Active clients from `getAdvisorClients()` function
- ✅ Tasks from `getAdvisorTasks()` function
- ✅ Recent tasks sorted by priority and due date
- ✅ All data is real-time from database

**Note:** Meetings are not yet in database (placeholder for future feature)

### 4. Policies Page (`/app/policies/page.tsx`)

**Status:** ✅ Already fetching from database correctly

**Data Sources:**
- ✅ Policies from `/api/policies?customerNumber=...` endpoint
- ✅ All policy data comes from `policies` table in database

## Database Functions Verified

### Document Functions (`/lib/db/neon.ts`)
- ✅ `getAllDocuments(category?, documentType?)` - Fetches documents with optional filters
- ✅ `getDocumentByNumber(documentNumber)` - Gets single document by number
- ✅ `incrementDocumentViewCount(documentNumber)` - Increments view count
- ✅ `incrementDocumentDownloadCount(documentNumber)` - Increments download count

### API Endpoints Verified
- ✅ `GET /api/documents` - Lists all documents (with optional category/type filters)
- ✅ `GET /api/documents?number={docNumber}` - Gets single document
- ✅ `GET /api/documents/{id}/view` - Views PDF inline
- ✅ `GET /api/documents/{id}/download` - Downloads PDF

## Testing Checklist

### Knowledge Base
- [ ] Visit `/advisor/knowledge`
- [ ] Click on a category (e.g., "Insurance Products")
- [ ] Verify documents are listed
- [ ] Click "View" on a document - should open PDF in new tab
- [ ] Click "Download" on a document - should download PDF
- [ ] Click "View PDF" on recent articles - should open PDF
- [ ] Verify document counts match database

### Products Page
- [ ] Visit `/products`
- [ ] Verify "View Guide" button appears for products with documents
- [ ] Click "View Guide" - should open PDF in new tab
- [ ] Click "Learn More" - should open PDF if available
- [ ] Verify all product guides are accessible

### Dashboard
- [ ] Visit `/advisor` (with advisor selected)
- [ ] Verify all stats are displayed (active clients, tasks, sales, etc.)
- [ ] Verify recent tasks are shown
- [ ] Verify all data matches database values

## Database Tables Used

1. **`document_files`** - 49 PDF documents
   - Product Guides (Insurance, Investment)
   - Forms (Unit Trust, Claims, General)
   - Brochures

2. **`advisors`** - 20 advisors
   - Performance metrics
   - Sales targets
   - Client counts

3. **`policies`** - 320 policies
   - Customer policies
   - Product types
   - Coverage amounts

4. **`tasks`** - 450 tasks
   - Advisor tasks
   - Due dates
   - Priorities

5. **`customers`** - 100 customers
   - Customer profiles
   - Policy relationships

## Next Steps

1. ✅ Knowledge base documents are now viewable/downloadable
2. ✅ Products page shows "View Guide" buttons
3. ✅ Dashboard fetches from database
4. ⏳ Consider adding a "Documents Library" page for browsing all documents
5. ⏳ Add document search functionality
6. ⏳ Add document categories to navigation

## Files Modified

1. `/app/advisor/knowledge/page.tsx` - Added document viewing/downloading, category filtering
2. `/app/products/page.tsx` - Added "View Guide" button, improved document matching
3. `/app/api/advisors/[id]/dashboard/route.ts` - Verified database integration (already working)

## Database Seed Files

All seed data is available in:
- `/LifeCompass/sql/09_documents_seed.sql` - 49 documents
- `/LifeCompass/sql/03_policies_seed.sql` - 320 policies
- `/LifeCompass/sql/01_advisors_seed.sql` - 20 advisors
- `/LifeCompass/sql/06_tasks_seed.sql` - 450 tasks

