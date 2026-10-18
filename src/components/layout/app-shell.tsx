"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  User,
  Bell,
  FolderKanban,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Only show in sidebar (not tab bar) */
  sidebarOnly?: boolean;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Tugas", href: "/tugas", icon: CheckSquare },
  { label: "Kalender", href: "/kalender", icon: Calendar },
  { label: "Profil", href: "/profil", icon: User },
];

const sidebarOnlyNav: NavItem[] = [
  { label: "Notifikasi", href: "/notifikasi", icon: Bell, sidebarOnly: true },
  { label: "Semua Proker", href: "/proker/semua", icon: FolderKanban, sidebarOnly: true },
  { label: "Admin", href: "/admin/pengguna", icon: Settings, sidebarOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar — Desktop (≥1024px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:border-line lg:bg-surface lg:fixed lg:inset-y-0">
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-line">
          <span className="font-mono font-bold text-lg tracking-tight text-ink">
            HMIF
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {[...mainNav, ...sidebarOnlyNav].map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      "hover:bg-bg",
                      active
                        ? "text-ink font-semibold border-l-[3px] border-accent -ml-px pl-[11px]"
                        : "text-ink-2"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-line bg-bg sticky top-0 z-40">
          <span className="font-mono font-bold text-lg tracking-tight text-ink">
            HMIF
          </span>
          <Link
            href="/notifikasi"
            className="relative p-2 -mr-2 text-ink-2 hover:text-ink transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            {/* TODO: notification dot */}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="max-w-[1120px] mx-auto px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile tab bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg border-t border-line">
          <ul className="flex items-center justify-around h-16">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px] text-xs transition-colors",
                      active ? "text-ink font-bold" : "text-ink-3"
                    )}
                  >
                    {active && (
                      <span className="absolute top-0 h-[3px] w-8 bg-accent rounded-b" />
                    )}
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
