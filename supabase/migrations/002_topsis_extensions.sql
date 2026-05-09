-- ============================================================
-- QUERY 1: DDL — jalankan ini dulu
-- ============================================================

ALTER TABLE public.criteria
  ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'safety_stock'
  CHECK (purpose IN ('safety_stock', 'priority_ranking', 'restock_quantity'));

ALTER TABLE public.topsis_calculations
  ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'safety_stock'
  CHECK (purpose IN ('safety_stock', 'priority_ranking', 'restock_quantity'));

ALTER TABLE public.topsis_calculations
  ADD COLUMN IF NOT EXISTS buffer_days INTEGER NOT NULL DEFAULT 7;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS avg_daily_sales NUMERIC;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS coefficient_of_variation NUMERIC;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS stockout_days INTEGER;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS current_safety_stock INTEGER;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS recommended_safety_stock INTEGER;


-- ============================================================
-- QUERY 2: SEED — jalankan setelah Query 1 berhasil
-- ============================================================

INSERT INTO public.criteria (code, name, description, type, weight, purpose) VALUES
  ('SS-C1', 'Rata-rata Penjualan Harian',
   'Rata-rata unit terjual per hari dalam periode kalkulasi.',
   'benefit', 0.35, 'safety_stock'),
  ('SS-C2', 'Variabilitas Penjualan (CV)',
   'Koefisien variasi penjualan. Permintaan tidak stabil membutuhkan buffer lebih besar.',
   'benefit', 0.25, 'safety_stock'),
  ('SS-C3', 'Kategori Pergerakan',
   'Kategori pergerakan barang. Fast moving membutuhkan safety stock lebih tinggi.',
   'benefit', 0.20, 'safety_stock'),
  ('SS-C4', 'Hari Tanpa Penjualan',
   'Jumlah hari tanpa transaksi penjualan dalam periode.',
   'benefit', 0.20, 'safety_stock')
ON CONFLICT (code) DO UPDATE SET
  purpose = EXCLUDED.purpose,
  weight = EXCLUDED.weight;

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, '0-0.5 unit/hari', 1, 0::numeric, 0.5::numeric, 'Penjualan sangat rendah' FROM public.criteria c WHERE c.code = 'SS-C1'
UNION ALL
SELECT c.id, '0.5-2 unit/hari', 2, 0.5::numeric, 2::numeric, 'Penjualan rendah' FROM public.criteria c WHERE c.code = 'SS-C1'
UNION ALL
SELECT c.id, '2-5 unit/hari', 3, 2::numeric, 5::numeric, 'Penjualan sedang' FROM public.criteria c WHERE c.code = 'SS-C1'
UNION ALL
SELECT c.id, '>5 unit/hari', 4, 5::numeric, NULL::numeric, 'Penjualan tinggi' FROM public.criteria c WHERE c.code = 'SS-C1'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, 'CV<0.3', 1, 0::numeric, 0.3::numeric, 'Variabilitas rendah' FROM public.criteria c WHERE c.code = 'SS-C2'
UNION ALL
SELECT c.id, 'CV 0.3-0.6', 2, 0.3::numeric, 0.6::numeric, 'Variabilitas sedang' FROM public.criteria c WHERE c.code = 'SS-C2'
UNION ALL
SELECT c.id, 'CV 0.6-1.0', 3, 0.6::numeric, 1.0::numeric, 'Variabilitas tinggi' FROM public.criteria c WHERE c.code = 'SS-C2'
UNION ALL
SELECT c.id, 'CV>1.0', 4, 1.0::numeric, NULL::numeric, 'Variabilitas sangat tinggi' FROM public.criteria c WHERE c.code = 'SS-C2'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, 'Slow Moving', 1, NULL::numeric, NULL::numeric, 'Pergerakan lambat' FROM public.criteria c WHERE c.code = 'SS-C3'
UNION ALL
SELECT c.id, 'Medium Moving', 2, NULL::numeric, NULL::numeric, 'Pergerakan sedang' FROM public.criteria c WHERE c.code = 'SS-C3'
UNION ALL
SELECT c.id, 'Fast Moving', 3, NULL::numeric, NULL::numeric, 'Pergerakan cepat' FROM public.criteria c WHERE c.code = 'SS-C3'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, '0 hari', 1, 0::numeric, 0::numeric, 'Tidak pernah tanpa penjualan' FROM public.criteria c WHERE c.code = 'SS-C4'
UNION ALL
SELECT c.id, '1-3 hari', 2, 1::numeric, 3::numeric, 'Jarang tanpa penjualan' FROM public.criteria c WHERE c.code = 'SS-C4'
UNION ALL
SELECT c.id, '4-7 hari', 3, 4::numeric, 7::numeric, 'Cukup sering tanpa penjualan' FROM public.criteria c WHERE c.code = 'SS-C4'
UNION ALL
SELECT c.id, '>7 hari', 4, 7::numeric, NULL::numeric, 'Sering tanpa penjualan' FROM public.criteria c WHERE c.code = 'SS-C4'
ON CONFLICT DO NOTHING;
