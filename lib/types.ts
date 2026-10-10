export type ProductType = 'seed' | 'kit' | 'tea';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type OrderStatus = 'RECEIVED' | 'PENDING_PAYMENT' | 'PAYMENT_REVIEW' | 'PAID' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'FAILED';
export type PaymentMethod = 'wallet_aggregator' | 'bank_transfer' | 'COD';
export type AdminRole = 'Owner' | 'Staff';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  option_name: string; // e.g. "Pack Size"
  option_value: string; // e.g. "250g", "500g"
  price_minor: number; // in paisa (100 paisa = 1 PKR)
  compare_price_minor?: number;
  weight_grams: number;
  inventory_quantity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  product_type: ProductType;
  status: ProductStatus;
  short_description: string;
  description: string;
  price_minor: number;
  compare_price_minor?: number;
  currency: string; // "PKR"
  weight_grams?: number;
  ingredients: string;
  usage_instructions: string;
  storage_instructions: string;
  flavor_profile?: string; // For teas: e.g. "Earthy, Floral, Calming"
  caffeine_level?: string; // For teas: "Caffeine-free" | "Low" | "Medium"
  steep_time?: string; // For teas: "4-5 mins"
  water_temp?: string; // For teas: "90°C - 95°C"
  growing_information?: string;
  nutrition_information?: {
    calories?: string;
    protein?: string;
    healthy_fats?: string;
    fiber?: string;
    zinc?: string;
    magnesium?: string;
    omega3?: string;
  };
  seo_title?: string;
  seo_description?: string;
  image_url: string;
  gallery_images?: string[];
  variants?: ProductVariant[];
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  badge?: 'BESTSELLER' | 'NEW' | 'POPULAR' | 'LIMITED';
  phase?: 'follicular' | 'luteal' | null;
}

export interface KitItem {
  id: string;
  kit_id: string;
  product_id: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  available_stock: number;
}

export interface Kit {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price_minor: number;
  compare_price_minor?: number;
  currency: string;
  status: ProductStatus;
  package_size: string;
  ingredients: string;
  usage_instructions: string;
  storage_instructions: string;
  compliance_status: string;
  image_url: string;
  gallery_images?: string[];
  items: KitItem[];
  computed_stock: number; // minimum available quantity of component products
  seo_title?: string;
  seo_description?: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  badge?: string;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. product_id + variant_id)
  product_id: string;
  variant_id?: string;
  kit_id?: string;
  name: string;
  slug: string;
  variant_label?: string;
  price_minor: number;
  image_url: string;
  quantity: number;
  product_type: ProductType;
  max_quantity?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  kit_id?: string;
  name_snapshot: string;
  sku_snapshot: string;
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
  metadata?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string;
  shipping_notes?: string;
  currency: string;
  subtotal_minor: number;
  shipping_minor: number;
  discount_minor: number;
  total_minor: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_courier?: string; // e.g. "TCS", "Leopards", "Trax", "PostEx"
  tracking_number?: string;
  idempotency_key?: string;
  receipt_path?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified_purchase: boolean;
  created_at: string;
}

export interface SiteSettings {
  store_name: string;
  tagline: string;
  currency: string;
  delivery_fee_minor: number;
  free_delivery_threshold_minor: number;
  bank_name: string;
  bank_account_title: string;
  bank_account_number: string;
  bank_iban: string;
  jazzcash_number: string;
  jazzcash_title: string;
  easypaisa_number: string;
  easypaisa_title: string;
  whatsapp_number: string;
  support_email: string;
  serviceable_cities: string[];
}

export interface StockAlertSubscription {
  id: string;
  product_id?: string;
  product_variant_id?: string;
  kit_id?: string;
  sellable_title: string;
  user_id?: string;
  email: string;
  normalized_email: string;
  status: 'ACTIVE' | 'NOTIFIED' | 'UNSUBSCRIBED';
  unsubscribe_token: string;
  created_at: string;
  notified_at?: string;
  last_error?: string;
}

export interface StockAlertDelivery {
  id: string;
  subscription_id: string;
  channel: 'EMAIL' | 'WHATSAPP';
  notification_type: 'CONFIRMATION' | 'RESTOCK' | 'ADMIN_ALERT';
  status: 'SENT' | 'FAILED';
  attempt_count: number;
  sent_at: string;
  error_message?: string;
}

