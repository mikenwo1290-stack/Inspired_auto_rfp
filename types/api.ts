// LlamaParse API Types
export interface LlamaParseResult {
  success: boolean;
  documentId: string;
  documentName: string;
  status: string;
  content?: string;
  metadata: {
    mode: 'fast' | 'balanced' | 'premium' | 'complexTables';
    wordCount: number;
    pageCount: number;
    summary?: string;
  };
}

// Response Generation API Types
export interface GenerateResponseResult {
  success: boolean;
  response: string;
  sources: string[];
  metadata: {
    confidence: number;
    generatedAt: string;
  };
}

// Common Error Response
export interface ApiErrorResponse {
  error: string;
} 