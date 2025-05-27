import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/middleware/api-handler';
import { MultiStepGenerateRequestSchema } from '@/lib/validators/multi-step-response';
import { multiStepResponseService } from '@/lib/services/multi-step-response-service';
import { organizationAuth } from '@/lib/services/organization-auth';

export async function POST(request: NextRequest) {
  return apiHandler(async () => {
    // Parse request body
    const body = await request.json();
    
    // Validate request
    const validatedRequest = MultiStepGenerateRequestSchema.parse(body);
    
    // Get authenticated user
    const user = await organizationAuth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    
    // Generate multi-step response
    const response = await multiStepResponseService.generateResponse(validatedRequest);
    
    return response;
  });
} 