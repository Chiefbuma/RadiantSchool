import { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import PortalShell from "@/components/portal-shell";

const adminLinks = [
  { href: "/portal/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/portal/admin/applications", label: "Applications", icon: "applications" },
  { href: "/portal/admin/students", label: "Students", icon: "students" },
  { href: "/portal/admin/onboarding", label: "Onboarding", icon: "onboarding" },
  { href: "/portal/admin/enrollments", label: "Enrollments", icon: "enrollments" },
  { href: "/portal/admin/programs", label: "Programs", icon: "programs" },
  { href: "/portal/admin/modules", label: "Modules", icon: "modules" },
  { href: "/portal/admin/cohorts", label: "Cohorts", icon: "cohorts" },
  { href: "/portal/admin/classes", label: "Classes", icon: "classes" },
  { href: "/portal/admin/resources", label: "Resources", icon: "resources" },
  { href: "/portal/admin/timetable", label: "Timetable", icon: "timetable" },
  { href: "/portal/admin/exams", label: "Exams", icon: "exams" },
  { href: "/portal/admin/results", label: "Results", icon: "results" },
  { href: "/portal/admin/fees", label: "Fees", icon: "fees" },
  { href: "/portal/admin/requests", label: "Requests", icon: "requests" },
  { href: "/portal/admin/clearance", label: "Clearance", icon: "clearance" },
  { href: "/portal/admin/graduation", label: "Graduation", icon: "graduation" },
  { href: "/portal/admin/users", label: "Users", icon: "users" },
];

const studentLinks = [
  { href: "/portal/student", label: "Dashboard", icon: "dashboard" },
  { href: "/#programs", label: "Website", icon: "website" },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const isStudent = user.roles.includes("student") && !user.permissions.includes("portal.admin");
  const homePath = isStudent ? "/portal/student" : "/portal/admin";

  return (
    <PortalShell
      user={{ full_name: user.full_name, roles: user.roles }}
      homePath={homePath}
      isStudent={isStudent}
      links={isStudent ? studentLinks : adminLinks}
    >
      {children}
    </PortalShell>
  );
}
