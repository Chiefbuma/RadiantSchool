import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { NotificationProvider } from "@/components/school-portal/notifications";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return <NotificationProvider>{children}</NotificationProvider>;
}
