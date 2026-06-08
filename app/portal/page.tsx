import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalIndexPage() {
  const user = await requireUser();
  redirect(user.roles.includes("student") && !user.permissions.includes("portal.admin") ? "/portal/student" : "/portal/admin");
}
