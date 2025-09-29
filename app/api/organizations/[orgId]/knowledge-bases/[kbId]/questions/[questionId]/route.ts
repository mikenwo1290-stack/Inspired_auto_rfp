import { NextRequest, NextResponse } from "next/server";

import { organizationService } from "@/lib/organization-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; kbId: string; questionId: string }> }
) {
  try {

    const { orgId, kbId, questionId } = await params;


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

    const question = await organizationService.getKnowledgeBaseQuestion(orgId, kbId, questionId);

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "Question not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Failed to fetch knowledge base question", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch knowledge base question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; kbId: string; questionId: string }> }
) {
  try {

    const { orgId, kbId, questionId } = await params;


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

    const { text, topic, tags } = await request.json();

    const updateData: { text?: string; topic?: string; tags?: string[] } = {};

    if (text) {
      updateData.text = text;
    }

    if (topic !== undefined) {
      updateData.topic = topic;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    const question = await organizationService.updateKnowledgeBaseQuestion(orgId, kbId, questionId, updateData);

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "Question not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Failed to update knowledge base question", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update knowledge base question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; kbId: string; questionId: string }> }
) {
  try {

    const { orgId, kbId, questionId } = await params;


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

    await organizationService.deleteKnowledgeBaseQuestion(orgId, kbId, questionId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete knowledge base question", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete knowledge base question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
