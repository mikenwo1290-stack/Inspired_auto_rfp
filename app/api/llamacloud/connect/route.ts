import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function POST(request: NextRequest) {
  try {
    const { organizationId, apiKey } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!organizationId || !apiKey) {
      return NextResponse.json(
        { error: 'Organization ID and API key are required' },
        { status: 400 }
      );
    }
    
    // Check if user has admin access to this organization
    const userRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      return NextResponse.json(
        { error: 'Only organization owners and admins can connect to LlamaCloud' },
        { status: 403 }
      );
    }

    // Initialize variables for LlamaCloud project info
    let llamaCloudProjectId: string | null = null;
    let llamaCloudProjectName: string | null = null;

    // Test the API key by making a request to LlamaCloud to get project info
    try {
      console.log('Testing LlamaCloud API key...');
      const testResponse = await fetch('https://api.cloud.llamaindex.ai/api/v1/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('LlamaCloud API response status:', testResponse.status);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('LlamaCloud API error:', errorText);
        return NextResponse.json(
          { error: 'Invalid API key or unable to connect to LlamaCloud' },
          { status: 400 }
        );
      }

      const projects = await testResponse.json();
      console.log('LlamaCloud projects:', projects);
      
      // For project-specific API keys, there should typically be one project returned
      if (projects && Array.isArray(projects) && projects.length > 0) {
        // Take the first project (project-specific API keys usually return one project)
        const project = projects[0];
        llamaCloudProjectId = project.id;
        llamaCloudProjectName = project.name;
        console.log('Connected to LlamaCloud project:', llamaCloudProjectName, '(', llamaCloudProjectId, ')');
      } else {
        console.warn('No projects found with this API key');
      }

    } catch (error) {
      console.error('Error verifying API key with LlamaCloud:', error);
      return NextResponse.json(
        { error: 'Unable to verify API key with LlamaCloud' },
        { status: 400 }
      );
    }

    // Store the API key and project connection info in the database
    const updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: {
        llamaCloudApiKey: apiKey,
        llamaCloudProjectId: llamaCloudProjectId,
        llamaCloudProjectName: llamaCloudProjectName,
        llamaCloudConnectedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      llamaCloudProjectId,
      llamaCloudProjectName 
    });
  } catch (error) {
    console.error('Error connecting to LlamaCloud:', error);
    return NextResponse.json(
      { error: 'Failed to connect to LlamaCloud' },
      { status: 500 }
    );
  }
} 