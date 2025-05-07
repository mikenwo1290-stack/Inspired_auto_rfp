// LlamaParse API Types
export interface LlamaParseResult {
  success: boolean;
  documentId: string;
  documentName: string;
  status: string;
  content: string;
  projectId?: string;
  metadata: {
    mode: 'fast' | 'balanced' | 'premium' | 'complexTables';
    wordCount: number;
    pageCount?: number;
    summary?: string;
  };
}

// Source information
export interface AnswerSource {
  id: number;
  fileName: string;
  filePath?: string;
  pageNumber?: string | number;
  documentId?: string;
  relevance?: number | null;
  textContent?: string | null;
}

// Response Generation API Types
export interface GenerateResponseResult {
  success: boolean;
  response: string;
  sources: AnswerSource[];
  metadata: {
    confidence: number;
    generatedAt: string;
  };
}

// Common Error Response
export interface ApiErrorResponse {
  error: string;
}

// RFP Question structure
export interface RfpQuestion {
  id: string;
  question: string;
  answer?: string;
  sources?: AnswerSource[];
}

export interface RfpSection {
  id: string;
  title: string;
  description?: string;
  questions: RfpQuestion[];
}

export interface RfpDocument {
  documentId: string;
  documentName: string;
  sections: RfpSection[];
  extractedAt: string;
} 