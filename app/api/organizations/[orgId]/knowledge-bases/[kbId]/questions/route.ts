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

    const questions = await organizationService.listKnowledgeBaseQuestions(orgId, kbId);

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Failed to fetch knowledge base questions", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch knowledge base questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { text, topic, tags } = await request.json();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Question text is required",
        },
        { status: 400 }
      );
    }

    const question = await organizationService.createKnowledgeBaseQuestion(orgId, kbId, {
      text,
      topic,
      tags,
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Failed to create knowledge base question", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create knowledge base question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
