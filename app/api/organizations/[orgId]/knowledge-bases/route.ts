import { NextRequest, NextResponse } from "next/server";

import { organizationService } from "@/lib/organization-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {


    const { orgId } = await params;



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

    const knowledgeBases = await organizationService.listKnowledgeBases(orgId);

    return NextResponse.json({
      success: true,
      data: knowledgeBases,
    });
  } catch (error) {
    console.error("Failed to fetch knowledge bases", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch knowledge bases",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {

    const { orgId } = await params;


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

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    const knowledgeBase = await organizationService.createKnowledgeBase(orgId, {
      name,
      description,
      createdById: currentUser.id,
    });

    return NextResponse.json({
      success: true,
      data: knowledgeBase,
    });
  } catch (error) {
    console.error("Failed to create knowledge base", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
