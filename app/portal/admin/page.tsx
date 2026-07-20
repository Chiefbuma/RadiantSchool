import SchoolPortalApp from "@/components/school-portal/SchoolPortalApp";
import { requireUser } from "@/lib/auth";

export default async function AdminPortalPage() {
  const user = await requireUser("portal.admin");
  return <SchoolPortalApp initialRole="admin" currentUserEmail={user.email} />;
}
