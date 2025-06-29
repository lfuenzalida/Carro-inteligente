export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  is_offer: boolean;
  description: string;
  image_url: string;
  stock: number;
  brand: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteItem {
  product_id: any;
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SmartCartItem {
  product_id: number;
  product: any;
  id: number;
  name: string;
  quantity: number;
  price: number;
  source: 'favorite' | 'history' | 'offer';
  subtotal: number;
}

export interface PurchaseHistoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  purchased_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  budget_limit: number;
}
export interface PurchaseRecord {
  id: number;                      // id del historial
  product_id: number;              // id del producto original ✅
  name: string;
  quantity: number | string;
  price: number | string;
  total: number | string;
  purchased_at: string;
}

export interface ProductSummary {
  id: any;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface GroupedPurchase {
  timestamp: string; // e.g., "2025-06-05T14:30"
  total: number;
  products: ProductSummary[];
}

