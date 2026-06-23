"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Building2,
  ClipboardList,
  UserCircle,
  Users,
  Ban,
  Settings,
  Shield,
  ScrollText,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const guestNav: NavItem[] = [
  { title: "Dashboard", href: "/guest", icon: Home },
  { title: "My Diwaniyas", href: "/guest/diwaniyas", icon: Building2 },
  { title: "My Registrations", href: "/guest/registrations", icon: ClipboardList },
  { title: "Host a Diwaniya", href: "/host/new", icon: PlusCircle },
  { title: "Profile", href: "/guest/profile", icon: UserCircle },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: Home },
  { title: "Registrations", href: "/admin/registrations", icon: ClipboardList },
  { title: "Guests", href: "/admin/guests", icon: Users },
  { title: "Banned Users", href: "/admin/bans", icon: Ban },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

const superAdminNav: NavItem[] = [
  { title: "Dashboard", href: "/super-admin", icon: Home },
  { title: "Diwaniyas", href: "/super-admin/diwaniyas", icon: Building2 },
  { title: "Users", href: "/super-admin/users", icon: Users },
  { title: "Activity Logs", href: "/super-admin/logs", icon: ScrollText },
];

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "super_admin"
      ? superAdminNav
      : role === "admin"
      ? adminNav
      : guestNav;

  const roleLabel =
    role === "super_admin"
      ? "Super Admin"
      : role === "admin"
      ? "Admin"
      : "Guest";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-cream/80 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gold text-teal-900">
              <Shield className="h-5 w-5" />
            </span>
            <span className="font-display text-lg text-cream">Kaifan HQ</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-cream/70 hover:bg-white/10 hover:text-cream md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <span className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cream/40">
            {roleLabel}
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-cream"
                    : "text-cream/70 hover:bg-white/[0.06] hover:text-cream"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
