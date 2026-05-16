-- ============================================================
-- QUERY 1: DDL — tambah kolom snapshot untuk Priority Ranking
-- ============================================================

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS current_stock_snapshot INTEGER;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS purchase_price_snapshot NUMERIC;

ALTER TABLE public.topsis_results
  ADD COLUMN IF NOT EXISTS margin_percentage NUMERIC;

-- ============================================================
-- QUERY 2: SEED kriteria Priority Ranking
-- ============================================================

INSERT INTO public.criteria (code, name, description, type, weight, purpose, metric_key, is_active) VALUES
  ('PR-C1', 'Tingkat Penjualan',
   'Rata-rata unit terjual per hari dalam periode kalkulasi. Semakin tinggi penjualan, semakin prioritas untuk direstok.',
   'benefit', 0.35, 'priority_ranking', 'avg_daily_sales', true),
  ('PR-C2', 'Stok Tersisa',
   'Jumlah stok barang yang masih tersedia. Stok rendah menandakan kebutuhan restok yang lebih mendesak.',
   'cost', 0.25, 'priority_ranking', 'current_stock', true),
  ('PR-C3', 'Harga Modal',
   'Harga pembelian/modal barang. Barang dengan harga modal lebih rendah lebih terjangkau untuk direstok.',
   'cost', 0.15, 'priority_ranking', 'purchase_price', true),
  ('PR-C4', 'Margin Keuntungan',
   'Persentase margin dari selisih harga jual dan harga modal. Margin tinggi berarti keuntungan lebih besar.',
   'benefit', 0.25, 'priority_ranking', 'margin_percentage', true)
ON CONFLICT (code) DO UPDATE SET
  purpose    = EXCLUDED.purpose,
  weight     = EXCLUDED.weight,
  metric_key = EXCLUDED.metric_key,
  is_active  = EXCLUDED.is_active;

-- ============================================================
-- QUERY 3: SEED sub-kriteria PR-C1 (Tingkat Penjualan)
-- ============================================================

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, '< 0.5 unit/hari',   1, 0::numeric,   0.5::numeric, 'Penjualan sangat lambat'  FROM public.criteria c WHERE c.code = 'PR-C1'
UNION ALL
SELECT c.id, '0.5–2 unit/hari',   2, 0.5::numeric, 2::numeric,   'Penjualan lambat'          FROM public.criteria c WHERE c.code = 'PR-C1'
UNION ALL
SELECT c.id, '2–5 unit/hari',     3, 2::numeric,   5::numeric,   'Penjualan sedang'          FROM public.criteria c WHERE c.code = 'PR-C1'
UNION ALL
SELECT c.id, '5–10 unit/hari',    4, 5::numeric,   10::numeric,  'Penjualan cepat'           FROM public.criteria c WHERE c.code = 'PR-C1'
UNION ALL
SELECT c.id, '> 10 unit/hari',    5, 10::numeric,  NULL::numeric,'Penjualan sangat cepat'    FROM public.criteria c WHERE c.code = 'PR-C1'
ON CONFLICT DO NOTHING;

-- ============================================================
-- QUERY 4: SEED sub-kriteria PR-C2 (Stok Tersisa) — inverted: stok rendah → skor tinggi
-- ============================================================

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, '0–2 unit',    5, 0::numeric,  2::numeric,   'Stok kritis'          FROM public.criteria c WHERE c.code = 'PR-C2'
UNION ALL
SELECT c.id, '3–7 unit',    4, 3::numeric,  7::numeric,   'Stok rendah'          FROM public.criteria c WHERE c.code = 'PR-C2'
UNION ALL
SELECT c.id, '8–12 unit',   3, 8::numeric,  12::numeric,  'Stok cukup'           FROM public.criteria c WHERE c.code = 'PR-C2'
UNION ALL
SELECT c.id, '13–20 unit',  2, 13::numeric, 20::numeric,  'Stok aman'            FROM public.criteria c WHERE c.code = 'PR-C2'
UNION ALL
SELECT c.id, '> 20 unit',   1, 21::numeric, NULL::numeric,'Stok berlebih'        FROM public.criteria c WHERE c.code = 'PR-C2'
ON CONFLICT DO NOTHING;

-- ============================================================
-- QUERY 5: SEED sub-kriteria PR-C3 (Harga Modal) — inverted: harga rendah → skor tinggi
-- ============================================================

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, '< Rp 80.000',            5, 0::numeric,      79999::numeric,  'Sangat terjangkau'  FROM public.criteria c WHERE c.code = 'PR-C3'
UNION ALL
SELECT c.id, 'Rp 80.000–199.999',      4, 80000::numeric,  199999::numeric, 'Terjangkau'         FROM public.criteria c WHERE c.code = 'PR-C3'
UNION ALL
SELECT c.id, 'Rp 200.000–399.999',     3, 200000::numeric, 399999::numeric, 'Menengah'           FROM public.criteria c WHERE c.code = 'PR-C3'
UNION ALL
SELECT c.id, 'Rp 400.000–599.999',     2, 400000::numeric, 599999::numeric, 'Mahal'              FROM public.criteria c WHERE c.code = 'PR-C3'
UNION ALL
SELECT c.id, '>= Rp 600.000',          1, 600000::numeric, NULL::numeric,   'Sangat mahal'       FROM public.criteria c WHERE c.code = 'PR-C3'
ON CONFLICT DO NOTHING;

-- ============================================================
-- QUERY 6: SEED sub-kriteria PR-C4 (Margin Keuntungan %)
-- ============================================================

INSERT INTO public.sub_criteria (criteria_id, label, value, range_min, range_max, description)
SELECT c.id, '0–15%',   1, 0::numeric,  14.99::numeric, 'Margin sangat kecil'  FROM public.criteria c WHERE c.code = 'PR-C4'
UNION ALL
SELECT c.id, '15–25%',  2, 15::numeric, 24.99::numeric, 'Margin kecil'         FROM public.criteria c WHERE c.code = 'PR-C4'
UNION ALL
SELECT c.id, '25–35%',  3, 25::numeric, 34.99::numeric, 'Margin sedang'        FROM public.criteria c WHERE c.code = 'PR-C4'
UNION ALL
SELECT c.id, '35–55%',  4, 35::numeric, 54.99::numeric, 'Margin besar'         FROM public.criteria c WHERE c.code = 'PR-C4'
UNION ALL
SELECT c.id, '> 55%',   5, 55::numeric, NULL::numeric,  'Margin sangat besar'  FROM public.criteria c WHERE c.code = 'PR-C4'
ON CONFLICT DO NOTHING;
