import { NextRequest, NextResponse } from 'next/server';
import { LlamaParseService } from '@/lib/llamaparse-service';
import { documentStore } from '@/lib/document-service';


// Initialize the LlamaParse service
let llamaParseService: LlamaParseService;

try {
  llamaParseService = new LlamaParseService();
} catch (error) {
  console.error('Failed to initialize LlamaParse service:', error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received request:', request);

    // Check if LlamaParse service is initialized
    if (!llamaParseService) {
      return NextResponse.json(
        { error: 'LlamaParse service is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get parsing mode options
    const fastMode = formData.get('fast_mode') === 'true';
    const premiumMode = formData.get('premium_mode') === 'true';
    const preset = formData.get('preset') as string | null;
    const documentName = formData.get('documentName') as string || file.name.split('.')[0];

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'pdf', 'doc', 'docx'].includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV, Excel, PDF, or Word files.' },
        { status: 400 }
      );
    }

    // Parse the file using LlamaParse
    const result = await llamaParseService.parseFile(file, {
      fastMode,
      premiumMode,
      complexTables: preset === 'complexTables',
    });

    // Create the response object
    const response = {
      success: true,
      documentId: result.id,
      documentName: documentName || result.documentName,
      status: result.status,
      content: result.content,
      metadata: result.metadata,
    };

    // Store the document in our document store
    documentStore.addDocument(response);
    
    console.log('Document processed successfully:', response.documentId);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
} 