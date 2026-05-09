"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Calculator,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  ChevronDown,
  ShoppingCart,
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
  children: { label: string; href: string }[];
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
    type: "link",
    label: "Barang",
    href: "/dashboard/products",
    icon: Package,
    roles: "all",
  },
  {
    type: "link",
    label: "Penjualan",
    href: "/dashboard/sales",
    icon: ShoppingCart,
    roles: ["kepala_toko"],
  },
  {
    type: "group",
    label: "Kalkulasi TOPSIS",
    icon: Calculator,
    roles: ["kepala_gudang", "kepala_toko", "owner"],
    basePath: "/dashboard/calculations",
    children: [
      { label: "Safety Stock", href: "/dashboard/calculations/safety-stock" },
      { label: "Priority Ranking", href: "/dashboard/calculations/priority-ranking" },
      { label: "Restock Quantity", href: "/dashboard/calculations/restock-quantity" },
    ],
  },
  {
    type: "link",
    label: "Laporan",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["owner"],
  },
  {
    type: "link",
    label: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    roles: ["owner"],
  },
  {
    type: "group",
    label: "Pengaturan",
    icon: Settings,
    roles: ["kepala_toko"],
    basePath: "/dashboard/settings",
    children: [
      { label: "Kategori Barang", href: "/dashboard/settings/categories" },
      { label: "Safety Stock", href: "/dashboard/settings/safety-stock" },
      { label: "Priority Ranking", href: "/dashboard/settings/priority-ranking" },
      { label: "Restock Quantity", href: "/dashboard/settings/restock-quantity" },
    ],
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

function NavGroupItem({ item, pathname }: { item: NavGroup; pathname: string }) {
  const isChildActive = item.children.some((c) => pathname.startsWith(c.href));
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
            {item.children.map((child) => {
              const active = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
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

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useUser();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
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
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!isVisible(item, profile?.role)) return null;

          if (item.type === "group") {
            return <NavGroupItem key={item.basePath} item={item} pathname={pathname} />;
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
    </aside>
  );
}
