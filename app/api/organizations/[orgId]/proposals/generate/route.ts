import { NextRequest, NextResponse } from "next/server";
import JSZip from "pizzip";
import Docxtemplater from "docxtemplater";

import { organizationService } from "@/lib/organization-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isMember = await organizationService.isUserOrganizationMember(currentUser.id, orgId);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const templateFile = formData.get("template");
    const payloadString = formData.get("payload");
    const fileName = formData.get("fileName")?.toString() || "proposal.docx";

    if (!(templateFile instanceof File)) {
      return NextResponse.json({ error: "Template file is required" }, { status: 400 });
    }

    if (!payloadString || typeof payloadString !== "string") {
      return NextResponse.json({ error: "Proposal payload is required" }, { status: 400 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadString);
    } catch (error) {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const arrayBuffer = await templateFile.arrayBuffer();
    const templateBinary = Buffer.from(arrayBuffer);

    const zip = new JSZip(templateBinary);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData(payload);

    try {
      doc.render();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to render template";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const generatedBuffer = doc.getZip().generate({ type: "nodebuffer" });

    return new NextResponse(generatedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": generatedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to generate proposal", error);
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 });
  }
}
