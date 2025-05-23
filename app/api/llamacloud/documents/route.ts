import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user is a member of this organization
    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      organizationId
    );
    
    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Get the organization with LlamaCloud connection info
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
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (!organization.llamaCloudApiKey || !organization.llamaCloudConnectedAt) {
      return NextResponse.json(
        { error: 'Organization is not connected to LlamaCloud' },
        { status: 400 }
      );
    }

    // Fetch pipelines/indexes from the connected LlamaCloud project
    try {
      console.log('Fetching pipelines for project:', organization.llamaCloudProjectId);
      
      // First, fetch all pipelines for the project
      const pipelinesResponse = await fetch('https://api.cloud.llamaindex.ai/api/v1/pipelines', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${organization.llamaCloudApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!pipelinesResponse.ok) {
        const errorText = await pipelinesResponse.text();
        console.error('Failed to fetch pipelines:', errorText);
        return NextResponse.json(
          { error: 'Failed to fetch pipelines from LlamaCloud' },
          { status: 400 }
        );
      }

      const pipelines = await pipelinesResponse.json();
      console.log('Found pipelines:', pipelines.length);
      
      // Filter pipelines to only include those from the connected LlamaCloud project
      const filteredPipelines = pipelines.filter((pipeline: any) => 
        pipeline.project_id === organization.llamaCloudProjectId
      );
      
      console.log(`Filtered ${pipelines.length} total pipelines to ${filteredPipelines.length} from project ${organization.llamaCloudProjectId}`);
      
      // Fetch files for each pipeline using the pipeline files endpoint
      const allDocuments = [];
      
      for (const pipeline of filteredPipelines) {
        try {
          console.log('Fetching files for pipeline:', pipeline.name, '(', pipeline.id, ')');
          
          const filesResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/pipelines/${pipeline.id}/files`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${organization.llamaCloudApiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (filesResponse.ok) {
            const files = await filesResponse.json();
            console.log('Found', files.length, 'files in pipeline:', pipeline.name);
            
            // Add pipeline info to each file/document
            const documentsWithPipeline = files.map((file: any) => ({
              ...file,
              pipelineName: pipeline.name,
              pipelineId: pipeline.id,
              // Map file properties to document properties for consistency
              name: file.file_name || file.name,
              status: file.status || 'unknown',
              created_at: file.created_at,
              updated_at: file.updated_at,
              size_bytes: file.file_size,
            }));
            
            allDocuments.push(...documentsWithPipeline);
          } else {
            console.warn('Failed to fetch files for pipeline:', pipeline.name, await filesResponse.text());
          }
        } catch (error) {
          console.error(`Error fetching files for pipeline ${pipeline.id}:`, error);
          // Continue with other pipelines even if one fails
        }
      }

      return NextResponse.json({
        projectName: organization.llamaCloudProjectName,
        projectId: organization.llamaCloudProjectId,
        pipelines: filteredPipelines,
        documents: allDocuments,
        connectedAt: organization.llamaCloudConnectedAt,
      });

    } catch (error) {
      console.error('Error fetching data from LlamaCloud:', error);
      return NextResponse.json(
        { error: 'Failed to fetch data from LlamaCloud' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in LlamaCloud documents API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 