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

export interface DishFilterParams {
  availability?: boolean;
  is_available?: boolean;
  daily_special?: boolean;
  category?: string;
  tags?: string | string[];
  name?: string;
  is_coming_soon?: boolean;
}

export interface DishListResponse {
  success: true;
  count: number;
  data: Dish[];
}

export interface DishSingleResponse {
  success: boolean;
  data?: Dish;
  error?: string;
}

export interface DishDeleteResponse {
  success: true;
  message: string;
  dish_id: string;
}
