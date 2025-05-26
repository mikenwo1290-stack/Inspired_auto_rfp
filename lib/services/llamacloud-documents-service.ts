import { ILlamaCloudDocumentsService } from '@/lib/interfaces/llamacloud-service';
import { 
  LlamaCloudDocumentsRequest,
  LlamaCloudDocumentsResponse,
  LlamaCloudFile
} from '@/lib/validators/llamacloud';
import { llamaCloudClient } from './llamacloud-client';
import { organizationAuth } from './organization-auth';
import { db } from '@/lib/db';
import { DatabaseError, LlamaCloudConnectionError, NotFoundError } from '@/lib/errors/api-errors';

/**
 * LlamaCloud documents service implementation
 */
export class LlamaCloudDocumentsService implements ILlamaCloudDocumentsService {
  /**
   * Get documents and pipelines for an organization
   */
  async getDocuments(request: LlamaCloudDocumentsRequest, userId: string): Promise<LlamaCloudDocumentsResponse> {
    try {
      // Step 1: Verify user has access to organization
      await organizationAuth.requireMembership(userId, request.organizationId);

      // Step 2: Get organization and verify LlamaCloud connection
      const organization = await this.getConnectedOrganization(request.organizationId);

      // Step 3: Fetch pipelines from LlamaCloud
      const pipelines = await llamaCloudClient.fetchPipelinesForProject(
        organization.llamaCloudApiKey!,
        organization.llamaCloudProjectId!
      );

      console.log(`Found ${pipelines.length} pipelines for project ${organization.llamaCloudProjectId}`);

      // Step 4: Fetch files for each pipeline
      const allDocuments = await this.fetchDocumentsForPipelines(
        organization.llamaCloudApiKey!,
        pipelines
      );

      console.log(`Found ${allDocuments.length} total documents across all pipelines`);

      // Step 5: Return structured response
      const response: LlamaCloudDocumentsResponse = {
        projectName: organization.llamaCloudProjectName,
        projectId: organization.llamaCloudProjectId,
        pipelines,
        documents: allDocuments,
        connectedAt: organization.llamaCloudConnectedAt,
      };

      return response;
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof LlamaCloudConnectionError || error instanceof NotFoundError) {
        throw error;
      }
      throw new LlamaCloudConnectionError(
        `Failed to fetch documents: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get organization and verify LlamaCloud connection
   */
  private async getConnectedOrganization(organizationId: string) {
    try {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          llamaCloudApiKey: true,
          llamaCloudProjectId: true,
          llamaCloudProjectName: true,
          llamaCloudConnectedAt: true,
        },
      });

      if (!organization) {
        throw new NotFoundError('Organization not found');
      }

      if (!organization.llamaCloudApiKey || !organization.llamaCloudConnectedAt) {
        throw new LlamaCloudConnectionError('Organization is not connected to LlamaCloud');
      }

      return organization;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof LlamaCloudConnectionError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetch documents for all pipelines
   */
  private async fetchDocumentsForPipelines(apiKey: string, pipelines: any[]): Promise<LlamaCloudFile[]> {
    const allDocuments: LlamaCloudFile[] = [];

    for (const pipeline of pipelines) {
      try {
        console.log(`Fetching files for pipeline: ${pipeline.name} (${pipeline.id})`);
        
        const files = await llamaCloudClient.fetchFilesForPipeline(apiKey, pipeline.id);
        
        console.log(`Found ${files.length} files in pipeline: ${pipeline.name}`);
        
        // Add pipeline info to each file/document and normalize the structure
        const documentsWithPipeline = files.map((file) => ({
          ...file,
          pipelineName: pipeline.name,
          pipelineId: pipeline.id,
          // Normalize file properties for consistency
          name: file.file_name || file.name || 'Unknown',
          status: file.status || 'unknown',
          size_bytes: file.file_size || file.size_bytes,
        }));
        
        allDocuments.push(...documentsWithPipeline);
      } catch (error) {
        // Continue with other pipelines even if one fails
        console.error(`Error fetching files for pipeline ${pipeline.id}:`, error);
      }
    }

    return allDocuments;
  }

  /**
   * Get documents statistics for monitoring
   */
  async getDocumentsStats(organizationId: string): Promise<{
    totalDocuments: number;
    totalPipelines: number;
    lastFetched: Date;
  }> {
    try {
      const user = await organizationAuth.getCurrentUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      const documents = await this.getDocuments({ organizationId }, user.id);
      
      return {
        totalDocuments: documents.documents.length,
        totalPipelines: documents.pipelines.length,
        lastFetched: new Date(),
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to get documents stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const llamaCloudDocumentsService = new LlamaCloudDocumentsService(); 