export interface Dish {
  dish_id: string;
  name: string;
  description: string;
  photo_url: string;
  price: number;
  tags: string[];
  daily_special: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DishCreateInput {
  name: string;
  description: string;
  photo_url: string;
  price: number;
  tags: string[];
  daily_special?: boolean;
  is_available?: boolean;
}

export interface DishUpdateInput {
  name?: string;
  description?: string;
  photo_url?: string;
  price?: number;
  tags?: string[];
  daily_special?: boolean;
  is_available?: boolean;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface FilterState {
  search: string;
  tag: string;
  dailySpecialOnly: boolean;
  inStockOnly: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
