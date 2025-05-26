import { ILlamaCloudConnectionService } from '@/lib/interfaces/llamacloud-service';
import { 
  LlamaCloudConnectRequest, 
  LlamaCloudDisconnectRequest,
  LlamaCloudConnectResponse,
  LlamaCloudDisconnectResponse 
} from '@/lib/validators/llamacloud';
import { llamaCloudClient } from './llamacloud-client';
import { organizationAuth } from './organization-auth';
import { db } from '@/lib/db';
import { DatabaseError, LlamaCloudConnectionError } from '@/lib/errors/api-errors';

/**
 * Main LlamaCloud connection management service
 */
export class LlamaCloudConnectionService implements ILlamaCloudConnectionService {
  /**
   * Connect organization to LlamaCloud
   */
  async connectToLlamaCloud(request: LlamaCloudConnectRequest, userId: string): Promise<LlamaCloudConnectResponse> {
    try {
      // Step 1: Verify user has admin access
      await organizationAuth.requireAdminAccess(userId, request.organizationId);

      // Step 2: Verify API key and project access
      const verifiedProject = await llamaCloudClient.verifyProjectAccess(
        request.apiKey, 
        request.projectId
      );

      console.log(`Verified access to LlamaCloud project: ${verifiedProject.name} (${verifiedProject.id})`);

      // Step 3: Store connection in database
      const updatedOrganization = await this.updateOrganizationConnection(request);

      // Step 4: Return success response
      const response: LlamaCloudConnectResponse = {
        success: true,
        organization: {
          id: updatedOrganization.id,
          name: updatedOrganization.name,
          llamaCloudApiKey: updatedOrganization.llamaCloudApiKey,
          llamaCloudProjectId: updatedOrganization.llamaCloudProjectId,
          llamaCloudProjectName: updatedOrganization.llamaCloudProjectName,
          llamaCloudOrgName: updatedOrganization.llamaCloudOrgName,
          llamaCloudConnectedAt: updatedOrganization.llamaCloudConnectedAt,
        },
      };

      return response;
    } catch (error) {
      if (error instanceof LlamaCloudConnectionError || error instanceof DatabaseError) {
        throw error;
      }
      throw new LlamaCloudConnectionError(
        `Failed to connect to LlamaCloud: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disconnect organization from LlamaCloud
   */
  async disconnectFromLlamaCloud(request: LlamaCloudDisconnectRequest, userId: string): Promise<LlamaCloudDisconnectResponse> {
    try {
      // Step 1: Verify user has admin access
      await organizationAuth.requireAdminAccess(userId, request.organizationId);

      // Step 2: Remove connection from database
      const updatedOrganization = await this.removeOrganizationConnection(request.organizationId);

      // Step 3: Return success response
      const response: LlamaCloudDisconnectResponse = {
        success: true,
        message: 'Successfully disconnected from LlamaCloud',
        organization: {
          id: updatedOrganization.id,
          name: updatedOrganization.name,
          llamaCloudApiKey: null,
          llamaCloudProjectId: null,
          llamaCloudProjectName: null,
          llamaCloudConnectedAt: null,
        },
      };

      return response;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to disconnect from LlamaCloud: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update organization with LlamaCloud connection details
   */
  private async updateOrganizationConnection(request: LlamaCloudConnectRequest) {
    try {
      return await db.organization.update({
        where: { id: request.organizationId },
        data: {
          llamaCloudApiKey: request.apiKey,
          llamaCloudProjectId: request.projectId,
          llamaCloudProjectName: request.projectName,
          llamaCloudOrgName: request.llamaCloudOrgName,
          llamaCloudConnectedAt: new Date(),
        },
      });
    } catch (error) {
      throw new DatabaseError(
        `Failed to update organization connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Remove LlamaCloud connection from organization
   */
  private async removeOrganizationConnection(organizationId: string) {
    try {
      return await db.organization.update({
        where: { id: organizationId },
        data: {
          llamaCloudApiKey: null,
          llamaCloudProjectId: null,
          llamaCloudProjectName: null,
          llamaCloudOrgName: null,
          llamaCloudConnectedAt: null,
        },
      });
    } catch (error) {
      throw new DatabaseError(
        `Failed to remove organization connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get connection statistics for monitoring
   */
  async getConnectionStats(organizationId: string): Promise<{
    isConnected: boolean;
    connectedAt: Date | null;
    projectName: string | null;
  }> {
    try {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        select: {
          llamaCloudConnectedAt: true,
          llamaCloudProjectName: true,
          llamaCloudApiKey: true,
        },
      });

      return {
        isConnected: !!organization?.llamaCloudApiKey,
        connectedAt: organization?.llamaCloudConnectedAt || null,
        projectName: organization?.llamaCloudProjectName || null,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to get connection stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const llamaCloudConnectionService = new LlamaCloudConnectionService(); 