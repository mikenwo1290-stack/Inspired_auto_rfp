import { NextRequest, NextResponse } from "next/server";

import { organizationService } from "@/lib/organization-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const { orgId, userId } = await params;
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = await organizationService.canManageOrganization(currentUser.id, orgId);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await organizationService.updateMemberRole(orgId, userId, role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update member role", error);
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const { orgId, userId } = await params;

    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = await organizationService.canManageOrganization(currentUser.id, orgId);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await organizationService.removeMember(orgId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove member", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
} 