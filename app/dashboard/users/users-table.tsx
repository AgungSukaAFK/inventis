"use client";

import { useTransition } from "react";
import { toggleUserActive, updateUserRole } from "./actions";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { toast } from "sonner";
import type { Profile } from "@/lib/supabase/types";

const roleLabel: Record<string, string> = {
  owner: "Owner",
  kepala_toko: "Kepala Toko",
  kepala_gudang: "Kepala Gudang",
};

const roleOptions = [
  { value: "kepala_gudang", label: "Kepala Gudang" },
  { value: "kepala_toko", label: "Kepala Toko" },
];

export function UsersTable({ users }: { users: Profile[] }) {
  const { profile: currentUser } = useUser();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(user: Profile) {
    startTransition(async () => {
      const result = await toggleUserActive(user.id, !user.is_active);
      if (result.error) toast.error(result.error);
      else
        toast.success(
          `Pengguna ${!user.is_active ? "diaktifkan" : "dinonaktifkan"}.`,
        );
    });
  }

  function handleChangeRole(userId: string, role: string) {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result.error) toast.error(result.error);
      else toast.success("Role berhasil diubah.");
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Nama
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Email
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Role
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Status
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Bergabung
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            return (
              <tr key={user.id} className="hover:bg-accent/40 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.full_name}
                  {isSelf && (
                    <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {roleLabel[user.role] ?? user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={user.is_active ? "default" : "outline"}
                    className={
                      user.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                        : "text-muted-foreground"
                    }
                  >
                    {user.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  {!isSelf && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Ubah Role</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        {roleOptions.map((r) => (
                          <DropdownMenuItem
                            key={r.value}
                            disabled={user.role === r.value}
                            onSelect={() => handleChangeRole(user.id, r.value)}
                          >
                            {r.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={
                            user.is_active
                              ? "text-destructive focus:text-destructive"
                              : "text-green-600 focus:text-green-600"
                          }
                          onSelect={() => handleToggleActive(user)}
                        >
                          {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Belum ada pengguna terdaftar.
        </div>
      )}
    </div>
  );
}
