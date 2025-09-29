import { NextRequest, NextResponse } from "next/server";

import { organizationService } from "@/lib/organization-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const { email, role } = await request.json();
    const normalizedEmail = (email as string)?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = await organizationService.canManageOrganization(currentUser.id, orgId);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await organizationService.inviteMember(orgId, normalizedEmail, role ?? "member", currentUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to invite organization member", error);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
} 