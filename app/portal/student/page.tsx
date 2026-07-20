import SchoolPortalApp from "@/components/school-portal/SchoolPortalApp";
import { requireUser } from "@/lib/auth";

export default async function StudentPortalPage() {
  const user = await requireUser("portal.student");
  return <SchoolPortalApp initialRole="student" currentUserEmail={user.email} />;
}
