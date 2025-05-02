import { NextRequest, NextResponse } from 'next/server';
import { documentStore } from '@/lib/document-service';

/**
 * Simple API to fetch all documents
 */
export async function GET(request: NextRequest) {
  try {
    // Get all documents from the document store
    const documents = documentStore.getAllDocuments();
    
    console.log(`Fetched ${documents.length} documents from store`);
    
    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 