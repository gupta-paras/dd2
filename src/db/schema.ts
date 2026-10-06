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
  dish_id?: string;
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

export interface DishFilterParams {
  availability?: boolean;
  is_available?: boolean;
  daily_special?: boolean;
  tags?: string | string[];
  name?: string;
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
