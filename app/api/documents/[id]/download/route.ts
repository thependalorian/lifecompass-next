// app/api/documents/[id]/download/route.ts
// API endpoint for downloading PDF documents

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import * as path from 'path';
import { getDocumentByNumber, incrementDocumentDownloadCount } from "@/lib/db/neon";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentNumber = params.id;

    // Get document metadata from database
    const document = await getDocumentByNumber(documentNumber);
    
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.is_active) {
      return NextResponse.json(
        { error: "Document is not available" },
        { status: 403 }
      );
    }

    // Resolve file path (relative to project root)
    // The file_path in database is relative to project root, so we need to go up one level from lifecompass-next
    const filePath = path.join(process.cwd(), '..', document.file_path);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }

    // Read the PDF file
    const fileBuffer = await fs.readFile(filePath);
    
    // Increment download count (async, don't wait)
    incrementDocumentDownloadCount(documentNumber).catch(err => 
      console.error("Error incrementing download count:", err)
    );

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.content_type || 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}

