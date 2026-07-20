import { NextResponse } from "next/server";
import { registerStudent } from "@/lib/portal-registration";
import { portalErrorResponse, requestId, requireApiPermission } from "@/lib/portal-security";

export async function POST(request: Request) {
  const correlationId = requestId(request);
  try {
    const actor = await requireApiPermission("students.register");
    const body = await request.json();
    const result = await registerStudent(body, actor, correlationId);
    return NextResponse.json(result, { status: 201, headers: { "x-request-id": correlationId } });
  } catch (error) {
    return portalErrorResponse(error, correlationId);
  }
}
