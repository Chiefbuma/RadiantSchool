import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser, type PortalUser } from "./auth";

export class PortalError extends Error {
  constructor(public status: number, message: string, public code = "PORTAL_ERROR") {
    super(message);
  }
}

export async function requireApiPermission(permission: string): Promise<PortalUser> {
  const user = await getCurrentUser();
  if (!user) throw new PortalError(401, "Authentication required", "UNAUTHENTICATED");
  if (!user.permissions.includes(permission) && !user.roles.includes("super_admin")) {
    throw new PortalError(403, "You do not have permission for this operation", "FORBIDDEN");
  }
  return user;
}

export function normalizeEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new PortalError(400, "A valid email is required", "INVALID_EMAIL");
  return email;
}

export function requiredText(value: unknown, field: string, max = 255) {
  const text = String(value ?? "").trim();
  if (!text) throw new PortalError(400, `${field} is required`, "VALIDATION_ERROR");
  if (text.length > max) throw new PortalError(400, `${field} is too long`, "VALIDATION_ERROR");
  return text;
}

export function requestId(request: Request) {
  return request.headers.get("x-request-id")?.slice(0, 100) || crypto.randomUUID();
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = new URL(process.env.APP_URL ?? request.url).origin;
  if (origin !== expected) throw new PortalError(403, "Cross-origin mutation rejected", "INVALID_ORIGIN");
}

export function portalErrorResponse(error: unknown, correlationId?: string) {
  if (error instanceof PortalError) {
    return NextResponse.json({ error: error.message, code: error.code, correlationId }, { status: error.status });
  }
  const databaseError = error as { code?: string; constraint?: string };
  if (databaseError?.code === "23505") {
    return NextResponse.json({ error: "A record with the same unique identity already exists", code: "DUPLICATE_RECORD", correlationId }, { status: 409 });
  }
  if (databaseError?.code === "23503") {
    return NextResponse.json({ error: "The operation references a missing or protected related record", code: "RELATION_CONFLICT", correlationId }, { status: 409 });
  }
  if (databaseError?.code === "23514" || databaseError?.code === "22P02" || databaseError?.code === "22007") {
    return NextResponse.json({ error: "The supplied data violates a validation rule", code: "VALIDATION_ERROR", correlationId }, { status: 400 });
  }
  console.error("Portal operation failed", { error, correlationId });
  return NextResponse.json({ error: "The operation could not be completed", code: "INTERNAL_ERROR", correlationId }, { status: 500 });
}
