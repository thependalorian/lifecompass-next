// app/api/documents/[id]/view/route.ts
// API endpoint for viewing PDF documents in browser
// Supports both external URLs and local files (for Vercel compatibility)

import { NextRequest, NextResponse } from "next/server";
import { getDocumentByNumber, incrementDocumentViewCount } from "@/lib/db/neon";

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
      // Increment view count (async, don't wait)
      incrementDocumentViewCount(documentNumber).catch((err) =>
        console.error("Error incrementing view count:", err),
      );

      // Redirect to external URL
      return NextResponse.redirect(document.original_url);
    }

    // Priority 2: Try to serve from public folder
    // Documents should be in public/documents/ folder for Vercel deployment
    if (document.file_path) {
      // Extract filename from file_path (handles paths like ../LifeCompass/.../filename.pdf)
      const filename = document.filename || document.file_path.split("/").pop() || "";
      
      // Construct possible public URLs
      const publicPaths = [
        `/documents/${filename}`, // Expected location: public/documents/filename.pdf
        document.file_path.startsWith("/") ? document.file_path : null, // If already a public path
      ].filter(Boolean) as string[];

      // Try each public path
      for (const publicPath of publicPaths) {
        try {
          // Construct full URL from request
          const baseUrl = new URL(request.url);
          const publicUrl = `${baseUrl.origin}${publicPath}`;
          
          // Fetch from public folder
          const response = await fetch(publicUrl, {
            method: "GET",
            headers: {
              "Accept": document.content_type || "application/pdf",
            },
          });

          if (response.ok) {
            // Increment view count (async, don't wait)
            incrementDocumentViewCount(documentNumber).catch((err) =>
              console.error("Error incrementing view count:", err),
            );

            // Return the file with proper headers
            const fileBuffer = await response.arrayBuffer();
            return new NextResponse(fileBuffer, {
              headers: {
                "Content-Type": document.content_type || "application/pdf",
                "Content-Disposition": `inline; filename="${document.filename}"`,
                "Content-Length": fileBuffer.byteLength.toString(),
                "Cache-Control": "public, max-age=3600", // Cache for 1 hour
              },
            });
          }
        } catch (fetchError) {
          // Try next path or fall through to error
          console.error(`Failed to fetch from ${publicPath}:`, fetchError);
          continue;
        }
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
          "The document file is not available. Please contact support or try downloading the document instead.",
        documentNumber: documentNumber,
        title: document.title,
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("Error viewing document:", error);
    return NextResponse.json(
      {
        error: "Failed to view document",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
