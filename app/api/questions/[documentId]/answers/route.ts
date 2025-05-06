import { NextRequest, NextResponse } from 'next/server';
import { questionsCache } from '../../cache';

// For storing answers - in a real app, use a database
const answersCache = new Map<string, Record<string, string>>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const documentId = (await params).documentId;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Get the answers from the request body
    const answers = await request.json();
    
    // Validate that we have the document
    if (!questionsCache.has(documentId)) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Store the answers
    answersCache.set(documentId, answers);
    
    return NextResponse.json({ 
      success: true,
      message: 'Answers saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving answers:', error);
    return NextResponse.json(
      { error: 'Failed to save answers' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const documentId = (await params).documentId;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Get the answers for this document
    const answers = answersCache.get(documentId) || {};
    
    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
} 