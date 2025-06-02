export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  is_offer: boolean;
}

export interface FavoriteItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SmartCartItem {
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
