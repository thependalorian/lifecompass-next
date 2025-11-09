// app/api/documents/[id]/download/route.ts
// API endpoint for downloading PDF documents
// Supports both external URLs and local files (for Vercel compatibility)

import { NextRequest, NextResponse } from "next/server";
import {
  getDocumentByNumber,
  incrementDocumentDownloadCount,
} from "@/lib/db/neon";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const documentNumber = params.id;

    // Get document metadata from database
    const document = await getDocumentByNumber(documentNumber);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (!document.is_active) {
      return NextResponse.json(
        { error: "Document is not available" },
        { status: 403 },
      );
    }

    // Priority 1: Use original_url if available (external hosting)
    if (document.original_url) {
      // Increment download count (async, don't wait)
      incrementDocumentDownloadCount(documentNumber).catch((err) =>
        console.error("Error incrementing download count:", err),
      );

      // Redirect to external URL for download
      return NextResponse.redirect(document.original_url);
    }

    // Priority 2: Try to fetch from public folder (for static assets)
    if (document.file_path) {
      // If file_path is already a URL path (starts with /), use it directly
      if (document.file_path.startsWith("/")) {
        // Increment download count (async, don't wait)
        incrementDocumentDownloadCount(documentNumber).catch((err) =>
          console.error("Error incrementing download count:", err),
        );

        // Redirect to public file
        return NextResponse.redirect(document.file_path);
      }

      // Try to construct public URL from file_path
      let publicPath = document.file_path
        .replace(/^.*\/public\//, "/")
        .replace(/^\.\.\//, "")
        .replace(/^\//, "");

      if (!publicPath.startsWith("/")) {
        publicPath = `/${publicPath}`;
      }

      // Try to fetch from public folder
      try {
        const publicUrl = new URL(publicPath, request.url);
        const response = await fetch(publicUrl.toString());

        if (response.ok) {
          // Increment download count (async, don't wait)
          incrementDocumentDownloadCount(documentNumber).catch((err) =>
            console.error("Error incrementing download count:", err),
          );

          // Return the file with download headers
          const fileBuffer = await response.arrayBuffer();
          return new NextResponse(fileBuffer, {
            headers: {
              "Content-Type": document.content_type || "application/pdf",
              "Content-Disposition": `attachment; filename="${document.filename}"`,
              "Content-Length": fileBuffer.byteLength.toString(),
            },
          });
        }
      } catch (fetchError) {
        console.error("Error fetching from public folder:", fetchError);
      }
    }

    // Priority 3: Fallback - return error with helpful message
    console.error(
      `Document ${documentNumber} has no accessible URL. original_url: ${document.original_url}, file_path: ${document.file_path}`,
    );

    return NextResponse.json(
      {
        error: "Document file not accessible",
        message:
          "The document file is not available for download. Please contact support.",
        documentNumber: documentNumber,
        title: document.title,
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      {
        error: "Failed to download document",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
