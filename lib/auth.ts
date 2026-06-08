import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";

export const SESSION_COOKIE = "rhti_session";

export type PortalUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  roles: string[];
  permissions: string[];
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, expected] = storedHash.split(":");
  if (scheme !== "scrypt" || !salt || !expected) return false;

  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");

  return expectedBuffer.length === actual.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12);

  await query(
    "INSERT INTO portal_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt]
  );

  return { token, expiresAt };
}

export async function getCurrentUser(): Promise<PortalUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await query<PortalUser>(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles,
      COALESCE(array_agg(DISTINCT p.permission_key) FILTER (WHERE rp.allowed = true), '{}') AS permissions
    FROM portal_sessions s
    JOIN portal_users u ON u.id = s.user_id
    LEFT JOIN portal_user_roles ur ON ur.user_id = u.id
    LEFT JOIN portal_roles r ON r.id = ur.role_id
    LEFT JOIN portal_role_permissions rp ON rp.role_id = r.id AND rp.allowed = true
    LEFT JOIN portal_permissions p ON p.id = rp.permission_id
    WHERE s.token_hash = $1
      AND s.expires_at > NOW()
      AND u.status = 'active'
    GROUP BY u.id`,
    [hashToken(token)]
  );

  return result.rows[0] ?? null;
}

export async function requireUser(permission?: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (permission && !user.permissions.includes(permission)) {
    redirect(user.permissions.includes("portal.student") ? "/portal/student" : "/login");
  }

  return user;
}

export async function destroyCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;

  await query("DELETE FROM portal_sessions WHERE token_hash = $1", [hashToken(token)]);
}
