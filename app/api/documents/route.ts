// app/api/documents/route.ts
// API endpoint for fetching documents/PDFs from database

import { NextRequest, NextResponse } from "next/server";
import { getAllDocuments, getDocumentByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentNumber = searchParams.get("number");
    const category = searchParams.get("category");
    const documentType = searchParams.get("type");

    if (documentNumber) {
      // Get single document by number
      const document = await getDocumentByNumber(documentNumber);

      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        id: document.document_number,
        documentNumber: document.document_number,
        title: document.title,
        filename: document.filename,
        filePath: document.file_path,
        originalUrl: document.original_url,
        fileSizeBytes: document.file_size_bytes,
        contentType: document.content_type,
        category: document.category,
        subcategory: document.subcategory,
        documentType: document.document_type,
        description: document.description,
        tags: document.tags || [],
        downloadCount: document.download_count || 0,
        viewCount: document.view_count || 0,
        isActive: document.is_active,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      });
    }

    // Get all documents with optional filters
    const documents = await getAllDocuments(
      category || undefined,
      documentType || undefined,
    );

    // Transform to match frontend expected format
    const transformedDocuments = documents.map((doc: any) => ({
      id: doc.document_number,
      documentNumber: doc.document_number,
      title: doc.title,
      filename: doc.filename,
      filePath: doc.file_path,
      originalUrl: doc.original_url,
      fileSizeBytes: doc.file_size_bytes,
      contentType: doc.content_type,
      category: doc.category,
      subcategory: doc.subcategory,
      documentType: doc.document_type,
      description: doc.description,
      tags: doc.tags || [],
      downloadCount: doc.download_count || 0,
      viewCount: doc.view_count || 0,
      isActive: doc.is_active,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
