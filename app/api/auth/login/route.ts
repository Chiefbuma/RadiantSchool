import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { normalizeEmail, portalErrorResponse, requestId } from "@/lib/portal-security";

export async function POST(request: NextRequest) {
  const correlationId = requestId(request);
  try {
  const body = await request.json();
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const recentFailures = await query<{count:string}>("SELECT count(*)::text count FROM portal_login_attempts WHERE email_normalized=$1 AND succeeded=false AND attempted_at>now()-interval '15 minutes'",[email]);
  if (Number(recentFailures.rows[0].count) >= 5) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });

  const result = await query<{
    id: string;
    password_hash: string;
    status: string;
    roles: string[];
  }>(
    `SELECT
      u.id,
      u.password_hash,
      u.status,
      COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
    FROM portal_users u
    LEFT JOIN portal_user_roles ur ON ur.user_id = u.id
    LEFT JOIN portal_roles r ON r.id = ur.role_id
    WHERE lower(u.email) = lower($1)
    GROUP BY u.id`,
    [email]
  );

  const user = result.rows[0];
  if (!user || user.status !== "active" || !verifyPassword(password, user.password_hash)) {
    await query("INSERT INTO portal_login_attempts(email_normalized,ip_address,succeeded) VALUES($1,NULLIF($2,'')::inet,false)",[email,request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null]);
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await query("DELETE FROM portal_login_attempts WHERE email_normalized=$1 AND succeeded=false",[email]);
  const session = await createSession(user.id,{ipAddress:request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),userAgent:request.headers.get("user-agent")});
  const response = NextResponse.json({
    ok: true,
    redirectTo: user.roles.includes("student") ? "/portal/student" : "/portal/admin",
  });

  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
  });

  return response;
  } catch (error) {
    return portalErrorResponse(error, correlationId);
  }
}
