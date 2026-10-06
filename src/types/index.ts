export interface Dish {
  dish_id: string;
  name: string;
  name_nl?: string;
  description: string;
  description_nl?: string;
  photo_url: string;
  price: number;
  category?: string;
  tags: string[];
  daily_special: boolean;
  is_available: boolean;
  is_coming_soon?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DishCreateInput {
  dish_id?: string;
  name: string;
  name_nl?: string;
  description: string;
  description_nl?: string;
  photo_url: string;
  price: number;
  category?: string;
  tags: string[];
  daily_special?: boolean;
  is_available?: boolean;
  is_coming_soon?: boolean;
}

export interface DishUpdateInput {
  name?: string;
  name_nl?: string;
  description?: string;
  description_nl?: string;
  photo_url?: string;
  price?: number;
  category?: string;
  tags?: string[];
  daily_special?: boolean;
  is_available?: boolean;
  is_coming_soon?: boolean;
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
