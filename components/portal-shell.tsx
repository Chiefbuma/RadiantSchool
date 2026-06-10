"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type PortalShellProps = {
  children: ReactNode;
  user: {
    full_name: string;
    roles: string[];
  };
  homePath: string;
  isStudent: boolean;
  links: NavItem[];
};

const icons = {
  dashboard: LayoutDashboard,
  applications: ClipboardList,
  students: Users,
  onboarding: CheckCircle2,
  enrollments: GraduationCap,
  programs: BookOpen,
  modules: LibraryBig,
  cohorts: GraduationCap,
  classes: Users,
  resources: FileText,
  timetable: CalendarDays,
  exams: ClipboardList,
  results: FileText,
  fees: Banknote,
  requests: ClipboardList,
  clearance: ShieldCheck,
  graduation: GraduationCap,
  users: Settings,
  website: BookOpen,
} as const;

function SidebarNav({
  links,
  onNavigate,
}: {
  links: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5 px-2 py-3">
      {links.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons] ?? FileText;
        const active = item.href === "/portal/admin"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex min-h-9 items-center gap-3 rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors",
              active
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {active ? <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" /> : null}
          </a>
        );
      })}
    </nav>
  );
}

export default function PortalShell({
  children,
  user,
  homePath,
  isStudent,
  links,
}: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="portal-shell flex h-screen w-full overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:flex">
        <a href={homePath} className="flex h-14 items-center border-b border-[hsl(var(--border))] px-5">
          <img src="/logo/rhti-logo.png" alt="RHTI" className="h-9 w-auto object-contain" />
        </a>
        <div className="flex-1 overflow-y-auto">
          <p className="px-5 pb-1 pt-4 text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
            {isStudent ? "Student Portal" : "Institution Management"}
          </p>
          <SidebarNav links={links} />
        </div>
        <div className="border-t border-[hsl(var(--border))] p-3">
          <button
            type="button"
            onClick={logout}
            className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:bg-red-500/5 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-[hsl(var(--card))] shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-[hsl(var(--border))] px-5">
              <img src="/logo/rhti-logo.png" alt="RHTI" className="h-9 w-auto object-contain" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-[hsl(var(--muted))]"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav links={links} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-[hsl(var(--border))] p-3">
              <button
                type="button"
                onClick={logout}
                className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-500/5"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-[hsl(var(--muted))] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <a href={homePath} className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground))]">
              {isStudent ? "Student Command Center" : "RHTI Administration"}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="m-0 text-xs font-bold text-[hsl(var(--foreground))]">{user.full_name}</p>
              <p className="m-0 text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                {user.roles.join(", ")}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[hsl(var(--muted))]/35 px-6 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
