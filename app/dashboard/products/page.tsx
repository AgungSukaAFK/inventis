import { createClient } from "@/lib/supabase/server";
import { ProductsTable } from "./products-table";
import { ProductsFilters } from "./products-filters";
import { ProductsPagination } from "./products-pagination";
import { AddProductDialog } from "./add-product-dialog";
import type { Product, UserRole } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  category?: string;
  movement?: string;
  status?: string;
  sort?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = (profileData?.role ?? "kepala_toko") as UserRole;
  const isKepalaToko = role === "kepala_toko";

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const page = Math.max(1, Number(params.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select("*, category:categories(id, name)", { count: "exact" });

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,sku.ilike.%${params.q}%`);
  }
  if (params.category) {
    query = query.eq("category_id", params.category);
  }
  if (params.movement) {
    query = query.eq("movement_category", params.movement);
  }
  if (params.status === "active") {
    query = query.eq("is_active", true);
  } else if (params.status === "inactive") {
    query = query.eq("is_active", false);
  }

  const sortCol = ["name", "current_stock", "created_at"].includes(params.sort ?? "")
    ? params.sort!
    : "name";

  query = query.order(sortCol, { ascending: sortCol !== "created_at" });
  query = query.range(from, to);

  const { data: products, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Data Barang</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {count ?? 0} barang terdaftar dalam sistem.
          </p>
        </div>
        {isKepalaToko && <AddProductDialog categories={categories ?? []} />}
      </div>

      <ProductsFilters categories={categories ?? []} />

      <ProductsTable products={(products ?? []) as Product[]} role={role} />

      <ProductsPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
