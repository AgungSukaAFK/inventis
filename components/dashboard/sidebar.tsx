"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  ChevronDown,
  ShoppingCart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/hooks/use-user";
import { useState } from "react";
import type { UserRole } from "@/lib/supabase/types";

type NavLink = {
  type: "link";
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[] | "all";
};

type NavGroup = {
  type: "group";
  label: string;
  icon: React.ElementType;
  roles: UserRole[] | "all";
  basePath: string;
  children: { label: string; href: string; roles?: UserRole[] | "all" }[];
};

type NavItem = NavLink | NavGroup;

const navItems: NavItem[] = [
  {
    type: "link",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: "all",
  },
  {
    type: "group",
    label: "Barang",
    icon: Package,
    roles: ["owner"],
    basePath: "/dashboard/products",
    children: [
      { label: "List Barang",     href: "/dashboard/products" },
      { label: "Kategori Barang", href: "/dashboard/settings/categories" },
    ],
  },
  {
    type: "group",
    label: "Barang",
    icon: Package,
    roles: ["kepala_toko"],
    basePath: "/dashboard/products",
    children: [
      { label: "List Barang",     href: "/dashboard/products" },
      { label: "Kategori Barang", href: "/dashboard/settings/categories" },
    ],
  },
  {
    type: "group",
    label: "Barang",
    icon: Package,
    roles: ["kepala_gudang"],
    basePath: "/dashboard/products",
    children: [
      { label: "List Barang",     href: "/dashboard/products" },
      { label: "Kategori Barang", href: "/dashboard/settings/categories" },
    ],
  },
  {
    type: "link",
    label: "Data Penjualan",
    href: "/dashboard/sales",
    icon: ShoppingCart,
    roles: ["kepala_toko"],
  },
  {
    type: "link",
    label: "Laporan PR",
    href: "/dashboard/reports/priority-ranking",
    icon: BarChart3,
    roles: ["kepala_toko"],
  },
  {
    type: "group",
    label: "Laporan",
    icon: BarChart3,
    roles: ["owner"],
    basePath: "/dashboard/reports",
    children: [
      { label: "Penjualan",        href: "/dashboard/reports/sales" },
      { label: "Priority Ranking", href: "/dashboard/reports/priority-ranking" },
    ],
  },
  {
    type: "link",
    label: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    roles: ["owner"],
  },
  {
    type: "link",
    label: "Kriteria TOPSIS",
    href: "/dashboard/settings/priority-ranking",
    icon: Settings,
    roles: ["kepala_gudang"],
  },
  {
    type: "link",
    label: "Priority Ranking",
    href: "/dashboard/calculations/priority-ranking",
    icon: BarChart3,
    roles: ["kepala_gudang"],
  },
  {
    type: "link",
    label: "Profil",
    href: "/dashboard/profile",
    icon: UserCircle,
    roles: "all",
  },
];

function isVisible(item: NavItem, role: UserRole | undefined) {
  if (!role) return false;
  return item.roles === "all" || item.roles.includes(role);
}

function NavGroupItem({
  item,
  pathname,
  role,
  onClose,
}: {
  item: NavGroup;
  pathname: string;
  role: UserRole | undefined;
  onClose?: () => void;
}) {
  const visibleChildren = item.children.filter((c) =>
    !c.roles || c.roles === "all" || (role && c.roles.includes(role)),
  );
  const isChildActive = visibleChildren.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(true);
  const Icon = item.icon;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isChildActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
            isChildActive
              ? "bg-primary/15 text-primary"
              : "bg-muted/60 text-muted-foreground group-hover:bg-accent group-hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-left leading-none">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="relative ml-3 pl-6">
          {/* vertical guide line */}
          <span className="absolute left-3 top-1 bottom-1 w-px bg-border" />
          <div className="space-y-0.5">
            {visibleChildren.map((child) => {
              const active = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className={cn(
                    "relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {/* active dot */}
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                      active ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  />
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarInner({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { profile } = useUser();

  return (
    <>
      {/* Logo */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-bj.png"
            alt="Banten Jaya Sport Fashion"
            width={38}
            height={38}
            className="rounded-full shrink-0"
          />
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-primary leading-none">Inventis</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Banten Jaya Sport Fashion
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!isVisible(item, profile?.role)) return null;

          if (item.type === "group") {
            return (
              <NavGroupItem
                key={item.basePath}
                item={item}
                pathname={pathname}
                role={profile?.role}
                onClose={onClose}
              />
            );
          }

          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/60 text-muted-foreground group-hover:bg-accent group-hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      {/* Desktop: always visible in flow */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card print:hidden">
        <SidebarInner />
      </aside>

      {/* Mobile: fixed slide-in drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out md:hidden print:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarInner onClose={onClose} />
      </aside>
    </>
  );
}
