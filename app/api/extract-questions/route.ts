import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/middleware/api-handler';
import { ExtractQuestionsRequestSchema } from '@/lib/validators/extract-questions';
import { questionExtractionService } from '@/lib/services/question-extraction-service';
import { ValidationError } from '@/lib/errors/api-errors';

export async function POST(request: NextRequest) {
  return apiHandler(async () => {
    // Parse and validate request body

    console.log("request", request);  
    const body = await request.json();
    const validatedRequest = ExtractQuestionsRequestSchema.parse(body);
    
    // Process document using service layer
    const result = await questionExtractionService.processDocument(validatedRequest);

    // Log success metrics
    const stats = questionExtractionService.getExtractionStats(result);
    console.log(`Successfully extracted ${stats.sectionCount} sections and ${stats.questionCount} questions for project ${validatedRequest.projectId}`);
    
    return result;
  });
} 