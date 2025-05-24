import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function POST(request: NextRequest) {
  try {
    const { organizationId, apiKey, projectId, projectName } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!organizationId || !apiKey || !projectId || !projectName) {
      return NextResponse.json(
        { error: 'Organization ID, API key, project ID, and project name are required' },
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

    // Test the API key and verify the specified project exists
    try {
      console.log('Testing LlamaCloud API key and verifying project access...');
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
      console.log('LlamaCloud projects found:', projects?.length || 0);
      
      // Verify the specified project exists and is accessible with this API key
      const selectedProject = projects?.find((p: any) => p.id === projectId);
      if (!selectedProject) {
        return NextResponse.json(
          { error: 'The specified project is not accessible with this API key' },
          { status: 400 }
        );
      }

      console.log('Verified access to LlamaCloud project:', selectedProject.name, '(', selectedProject.id, ')');

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
        llamaCloudProjectId: projectId,
        llamaCloudProjectName: projectName,
        llamaCloudConnectedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error('Error connecting to LlamaCloud:', error);
    return NextResponse.json(
      { error: 'Failed to connect to LlamaCloud' },
      { status: 500 }
    );
  }
} 