import { NextRequest, NextResponse } from "next/server";

import { organizationService } from "@/lib/organization-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; kbId: string }> }
) {
  try {

    const { orgId, kbId } = await params;


    const currentUser = await organizationService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const knowledgeBase = await organizationService.getKnowledgeBase(orgId, kbId, {
      includeQuestions: true,
    });

    if (!knowledgeBase) {
      return NextResponse.json(
        {
          success: false,
          error: "Knowledge base not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: knowledgeBase,
    });
  } catch (error) {
    console.error("Failed to fetch knowledge base", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; kbId: string }> }
) {
  try {

    const { orgId, kbId } = await params;


    const currentUser = await organizationService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const { name, description } = await request.json();

    const updateData: { name?: string; description?: string } = {};

    if (name) {
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const knowledgeBase = await organizationService.updateKnowledgeBase(orgId, kbId, updateData);

    if (!knowledgeBase) {
      return NextResponse.json(
        {
          success: false,
          error: "Knowledge base not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: knowledgeBase,
    });
  } catch (error) {
    console.error("Failed to update knowledge base", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; kbId: string }> }
) {
  try {

    const { orgId, kbId } = await params;


    const currentUser = await organizationService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    await organizationService.deleteKnowledgeBase(orgId, kbId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete knowledge base", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
