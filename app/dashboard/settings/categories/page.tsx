import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddCategoryDialog } from "./add-category-dialog";
import { CategoriesList } from "./categories-list";
import type { Category } from "@/lib/supabase/types";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profileData?.role !== "kepala_toko") {
    redirect("/dashboard");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kategori Barang</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola kategori untuk pengelompokan barang di halaman produk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Kategori</CardTitle>
              <CardDescription className="mt-1">
                Kategori digunakan untuk mengelompokkan barang di halaman produk.
              </CardDescription>
            </div>
            <AddCategoryDialog />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <CategoriesList categories={(categories ?? []) as Category[]} />
        </CardContent>
      </Card>
    </div>
  );
}
