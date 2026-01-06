export interface Ingredient {
  _id: string;
  name: string;
  calories: number;
  category: string;
  description?: string;
  servingSize?: number;
  store: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DishIngredient {
  ingredientId: Ingredient | string;
  weight: number;
}

export interface Dish {
  _id: string;
  name: string;
  ingredients: DishIngredient[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MealDish {
  dishId: Dish | string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  _id: string;
  date: string;
  mealType: MealType;
  dishes: MealDish[];
  isShared: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
