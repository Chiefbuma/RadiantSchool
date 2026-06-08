import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const session = await createSession(user.id);
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
}
