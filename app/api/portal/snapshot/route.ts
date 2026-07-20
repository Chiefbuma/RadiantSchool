import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPortalSnapshot } from "@/lib/portal-snapshot";
import { PortalError, portalErrorResponse, requestId } from "@/lib/portal-security";

export async function GET(request: Request) {
  const correlationId = requestId(request);
  try {
    const user = await getCurrentUser();
    if (!user || (!user.permissions.includes("portal.admin") && !user.permissions.includes("portal.student"))) throw new PortalError(401, "Authentication required");
    return NextResponse.json(await getPortalSnapshot(user), { headers: { "cache-control": "private, no-store", "x-request-id": correlationId } });
  } catch (error) {
    return portalErrorResponse(error, correlationId);
  }
}
