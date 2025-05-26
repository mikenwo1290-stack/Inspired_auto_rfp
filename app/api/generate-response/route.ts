/*
 * This functionality has been temporarily removed to focus on document upload.
 * We'll implement it in a future update when adding the dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { LlamaIndexService } from '@/lib/llama-index-service';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function POST(request: NextRequest) {
  try {
    const { question, documentIds, selectedIndexIds, useAllIndexes, projectId } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'No project ID provided' },
        { status: 400 }
      );
    }

    // Get current user for authorization
    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get project with organization info
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          select: {
            id: true,
            llamaCloudApiKey: true,
            llamaCloudProjectId: true,
            llamaCloudProjectName: true,
            llamaCloudConnectedAt: true,
          },
        },
        projectIndexes: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this organization
    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      project.organization.id
    );
    
    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Check if organization is connected to LlamaCloud
    if (!project.organization.llamaCloudApiKey || !project.organization.llamaCloudConnectedAt) {
      return NextResponse.json(
        { error: 'Organization is not connected to LlamaCloud' },
        { status: 400 }
      );
    }

    // If no indexes are selected and useAllIndexes is false, return a default response
    if (!useAllIndexes && (!selectedIndexIds || selectedIndexIds.length === 0)) {
      console.log('No indexes selected, using default response generation');
      const llamaIndexService = new LlamaIndexService();
      const result = await llamaIndexService.generateDefaultResponse(question);
      
      return NextResponse.json({
        success: true,
        response: result.response,
        sources: result.sources,
        metadata: {
          confidence: result.confidence,
          generatedAt: result.generatedAt,
          indexesUsed: [],
          note: 'Generated using default responses due to no selected indexes'
        },
      });
    }

    // Get the actual index names from the selected IDs
    const selectedIndexNames = project.projectIndexes
      .filter(projectIndex => selectedIndexIds.includes(projectIndex.indexId))
      .map(projectIndex => projectIndex.indexName);

    if (selectedIndexNames.length === 0 && !useAllIndexes) {
      console.log('No valid indexes found for selected IDs, using default response');
      const llamaIndexService = new LlamaIndexService();
      const result = await llamaIndexService.generateDefaultResponse(question);
      
      return NextResponse.json({
        success: true,
        response: result.response,
        sources: result.sources,
        metadata: {
          confidence: result.confidence,
          generatedAt: result.generatedAt,
          indexesUsed: [],
          note: 'Generated using default responses due to no valid indexes found'
        },
      });
    }

    // Initialize LlamaIndex service with organization's configuration
    const llamaIndexService = new LlamaIndexService({
      apiKey: project.organization.llamaCloudApiKey,
      projectName: project.organization.llamaCloudProjectName || 'Default',
      indexNames: useAllIndexes ? undefined : selectedIndexNames,
    });

    // Generate response using LlamaIndex with selected indexes
    const result = await llamaIndexService.generateResponse(question, {
      documentIds,
      selectedIndexIds: useAllIndexes ? undefined : selectedIndexIds,
      useAllIndexes
    });

    console.log('Generated response with indexes:', selectedIndexNames);
    
    return NextResponse.json({
      success: true,
      response: result.response,
      sources: result.sources,
      metadata: {
        confidence: result.confidence,
        generatedAt: result.generatedAt,
        indexesUsed: selectedIndexNames,
      },
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
