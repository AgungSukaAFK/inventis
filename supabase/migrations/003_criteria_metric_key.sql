-- Add metric_key column so the calculation engine can dynamically map
-- each criterion to a computable metric without hardcoding criterion codes.
ALTER TABLE public.criteria
  ADD COLUMN IF NOT EXISTS metric_key TEXT;

-- Backfill existing safety_stock criteria
UPDATE public.criteria SET metric_key = 'avg_daily_sales'         WHERE code = 'SS-C1' AND purpose = 'safety_stock';
UPDATE public.criteria SET metric_key = 'coefficient_of_variation' WHERE code = 'SS-C2' AND purpose = 'safety_stock';
UPDATE public.criteria SET metric_key = 'movement_category'        WHERE code = 'SS-C3' AND purpose = 'safety_stock';
UPDATE public.criteria SET metric_key = 'stockout_days'            WHERE code = 'SS-C4' AND purpose = 'safety_stock';
