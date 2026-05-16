export type UserRole = "owner" | "kepala_toko" | "kepala_gudang";

export type CalculationPurpose = "safety_stock" | "priority_ranking" | "restock_quantity";
export type CalculationStatus = "draft" | "completed" | "archived";
export type CriteriaType = "benefit" | "cost";

export type SafetyStockMetricKey =
  | "avg_daily_sales"
  | "coefficient_of_variation"
  | "movement_category"
  | "stockout_days";

export type PriorityRankingMetricKey =
  | "avg_daily_sales"
  | "current_stock"
  | "purchase_price"
  | "margin_percentage";

export type MetricKey = SafetyStockMetricKey | PriorityRankingMetricKey;

export type Criteria = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: CriteriaType;
  weight: number;
  purpose: CalculationPurpose;
  metric_key: MetricKey | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SubCriteria = {
  id: string;
  criteria_id: string;
  label: string;
  value: number;
  range_min: number | null;
  range_max: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TopsisCalculation = {
  id: string;
  title: string;
  description: string | null;
  purpose: CalculationPurpose;
  calculation_date: string;
  period_start: string | null;
  period_end: string | null;
  buffer_days: number;
  budget: number;
  total_alternatives: number;
  status: CalculationStatus;
  notes: string | null;
  calculated_by: string;
  created_at: string;
  updated_at: string;
};

export type TopsisResult = {
  id: string;
  calculation_id: string;
  product_id: string;
  product?: Pick<Product, "id" | "sku" | "name" | "current_stock" | "safety_stock" | "movement_category">;
  distance_positive: number;
  distance_negative: number;
  preference_score: number;
  preference_percentage: number;
  rank_order: number;
  recommended_qty: number;
  estimated_cost: number;
  decision_summary: string | null;
  // Safety Stock metrics
  avg_daily_sales: number | null;
  coefficient_of_variation: number | null;
  stockout_days: number | null;
  current_safety_stock: number | null;
  recommended_safety_stock: number | null;
  // Priority Ranking metrics (snapshot at time of calculation)
  current_stock_snapshot: number | null;
  purchase_price_snapshot: number | null;
  margin_percentage: number | null;
  created_at: string;
};

export type MovementCategory = "fast_moving" | "medium_moving" | "slow_moving";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  category: Category | null;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  safety_stock: number;
  movement_category: MovementCategory;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          link_url: string | null;
          related_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          message: string;
          type?: string;
          link_url?: string | null;
          related_id?: string | null;
          is_read?: boolean;
        };
        Update: Partial<{
          is_read: boolean;
        }>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Category, "id">>;
      };
      products: {
        Row: Omit<Product, "category">;
        Insert: Omit<Product, "id" | "category" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "category" | "created_at">>;
      };
      sales_history: {
        Row: {
          id: string;
          product_id: string;
          sale_date: string;
          quantity_sold: number;
          revenue: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          product_id: string;
          sale_date: string;
          quantity_sold: number;
          revenue?: number;
          notes?: string | null;
        };
        Update: never;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Record<string, unknown> | null;
          new_data?: Record<string, unknown> | null;
          ip_address?: string | null;
        };
        Update: {
          user_id?: string | null;
          action?: string;
          table_name?: string;
        };
      };
    };
  };
};
