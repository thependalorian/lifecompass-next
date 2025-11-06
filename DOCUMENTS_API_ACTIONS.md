# Documents API Actions

## Overview
The Documents API provides endpoints for managing and accessing PDF documents stored in the database. Documents are stored in the `document_files` table and can be listed, viewed, or downloaded.

## API Endpoints

### 1. GET `/api/documents`
**Purpose:** List all documents or fetch a single document by number

**Query Parameters:**
- `number` (optional): Document number to fetch a single document
- `category` (optional): Filter by category (e.g., "Insurance", "Investment")
- `type` (optional): Filter by document type (e.g., "Product Guide", "Form")

**Actions:**
- **List all documents:** `GET /api/documents`
- **List by category:** `GET /api/documents?category=Insurance`
- **List by category and type:** `GET /api/documents?category=Insurance&type=Product Guide`
- **Get single document:** `GET /api/documents?number=DOC-001`

**Response Format:**
```json
{
  "id": "DOC-001",
  "documentNumber": "DOC-001",
  "title": "OMP Funeral Insurance Guide",
  "filename": "omp-funeral-guide.pdf",
  "filePath": "/path/to/file.pdf",
  "originalUrl": "https://...",
  "fileSizeBytes": 123456,
  "contentType": "application/pdf",
  "category": "Insurance",
  "subcategory": "Life Insurance",
  "documentType": "Product Guide",
  "description": "Complete guide to OMP Funeral Insurance",
  "tags": ["funeral", "insurance"],
  "downloadCount": 42,
  "viewCount": 128,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Usage:**
- Used in `app/products/page.tsx` to fetch product guides and forms
- Used in agent tools (`listAvailableDocumentsTool`, `searchDocumentsTool`) for AI assistant document access

---

### 2. GET `/api/documents/[id]/download`
**Purpose:** Download a PDF document as a file attachment

**Route Parameters:**
- `id`: Document number (e.g., "DOC-001")

**Actions:**
- **Download document:** `GET /api/documents/DOC-001/download`

**Response:**
- Returns PDF file as binary data with `Content-Disposition: attachment`
- Automatically increments `download_count` in database
- Headers include:
  - `Content-Type`: `application/pdf` (or document's content type)
  - `Content-Disposition`: `attachment; filename="document.pdf"`
  - `Content-Length`: File size in bytes

**Usage:**
- Used in agent tools to provide download URLs to AI assistant
- Can be used directly in frontend: `<a href="/api/documents/DOC-001/download">Download</a>`
- Opens browser download dialog when accessed

---

### 3. GET `/api/documents/[id]/view`
**Purpose:** View a PDF document in the browser (inline display)

**Route Parameters:**
- `id`: Document number (e.g., "DOC-001")

**Actions:**
- **View document:** `GET /api/documents/DOC-001/view`

**Response:**
- Returns PDF file as binary data with `Content-Disposition: inline`
- Automatically increments `view_count` in database
- Headers include:
  - `Content-Type`: `application/pdf` (or document's content type)
  - `Content-Disposition`: `inline; filename="document.pdf"`
  - `Content-Length`: File size in bytes

**Usage:**
- Used in `app/products/page.tsx` → `handleLearnMore()` function
- Opens PDF in new browser tab for viewing
- Example: `window.open('/api/documents/DOC-001/view', '_blank')`

---

## Frontend Integration

### Products Page (`app/products/page.tsx`)
**Actions that lead to documents API:**

1. **"Learn More" Button Click:**
   - User clicks "Learn More" on a product card
   - `handleLearnMore(productName)` is called
   - Looks up document in `documents` map
   - Opens PDF viewer: `window.open('/api/documents/${doc.documentNumber}/view', '_blank')`
   - **Result:** PDF opens in new tab for viewing

2. **"Get Quote" Button Click:**
   - User clicks "Get Quote" on a product card
   - `handleGetQuote(productName)` is called
   - Redirects to advisor booking page with product context
   - (Documents API not directly used, but advisor can access documents)

**Document Fetching:**
- On page load, fetches documents by category:
  - `GET /api/documents?category=Insurance&type=Product Guide`
  - `GET /api/documents?category=Investment&type=Form`
- Maps documents to products for quick access

---

## Agent Tools Integration

### TypeScript Agent (`lib/agent/tools.ts`)

**1. `listAvailableDocumentsTool`:**
- Lists all available documents with optional filters
- Returns documents with `downloadUrl` and `viewUrl` properties
- **Action URLs provided:**
  - `downloadUrl`: `/api/documents/${doc.documentNumber}/download`
  - `viewUrl`: `/api/documents/${doc.documentNumber}/view`

**2. `searchDocumentsTool`:**
- Searches documents by title, description, or tags
- Returns matching documents with download/view URLs
- **Action URLs provided:**
  - `downloadUrl`: `/api/documents/${doc.documentNumber}/download`
  - `viewUrl`: `/api/documents/${doc.documentNumber}/view`

**Usage in AI Assistant:**
- When user asks about documents, agent can:
  1. List available documents
  2. Search for specific documents
  3. Provide download or view URLs
  4. User can click links to download or view PDFs

---

## Database Actions

All endpoints interact with the `document_files` table:

1. **Read Operations:**
   - `getDocumentByNumber()`: Fetch single document
   - `getAllDocuments()`: Fetch all documents with filters

2. **Update Operations:**
   - `incrementDocumentDownloadCount()`: Track downloads
   - `incrementDocumentViewCount()`: Track views

3. **File System Operations:**
   - Read PDF files from filesystem
   - Path resolution: `path.join(process.cwd(), '..', document.file_path)`
   - File existence validation before serving

---

## Summary of Actions

| Action | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| List Documents | `/api/documents` | GET | Get all documents or single document |
| Filter Documents | `/api/documents?category=X&type=Y` | GET | Filter documents by category/type |
| View Document | `/api/documents/[id]/view` | GET | Open PDF in browser |
| Download Document | `/api/documents/[id]/download` | GET | Download PDF file |
| Track Views | `/api/documents/[id]/view` | GET | Auto-increments view_count |
| Track Downloads | `/api/documents/[id]/download` | GET | Auto-increments download_count |

---

## User Flows

### Flow 1: Customer Views Product Guide
1. User navigates to `/products`
2. Clicks "Learn More" on a product
3. `handleLearnMore()` → `window.open('/api/documents/DOC-001/view')`
4. PDF opens in new tab
5. View count incremented in database

### Flow 2: Customer Downloads Form
1. User asks AI assistant: "I need the unit trust buying form"
2. Agent calls `searchDocumentsTool`
3. Agent provides download URL: `/api/documents/DOC-002/download`
4. User clicks link or agent opens it
5. Browser downloads PDF file
6. Download count incremented in database

### Flow 3: Advisor Accesses Documents
1. Advisor asks AI assistant: "Show me all insurance product guides"
2. Agent calls `listAvailableDocumentsTool(category="Insurance")`
3. Agent lists documents with view/download links
4. Advisor clicks to view or download
5. View/download counts tracked

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `404`: Document not found
- `403`: Document is inactive/not available
- `500`: Server error (file not found, read error, etc.)

Error responses include JSON:
```json
{
  "error": "Document not found"
}
```

---

## Security Considerations

1. **Active Check:** Only active documents (`is_active = true`) are served
2. **File Path Validation:** File existence checked before serving
3. **Content Type:** Proper MIME types set for PDF files
4. **Download Tracking:** All downloads tracked for analytics
5. **View Tracking:** All views tracked for analytics

