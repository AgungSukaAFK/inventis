import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveProducts, getMonthlySales } from "./actions";
import { SalesForm } from "./sales-form";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
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

  const { month: monthParam } = await searchParams;
  const month = monthParam ?? new Date().toISOString().slice(0, 7);

  const [products, salesMap] = await Promise.all([
    getActiveProducts(),
    getMonthlySales(month),
  ]);

  return (
    <div className="w-full">
      <SalesForm month={month} products={products} salesMap={salesMap} />
    </div>
  );
}
