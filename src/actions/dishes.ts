"use server";

import connectDB from "@/lib/db";
import { serialize } from "@/lib/utils";
import Dish from "@/models/Dish";
import { Dish as DishType } from "@/types";
import { revalidatePath } from "next/cache";

export async function getDishes(): Promise<DishType[]> {
  try {
    await connectDB();
    const dishes = await Dish.find().populate("ingredients.ingredientId");
    return serialize(dishes);
  } catch (error) {
    console.error("Failed to fetch dishes:", error);
    throw new Error("Failed to fetch dishes");
  }
}

export async function createDish(
  data: Omit<DishType, "_id" | "createdAt" | "updatedAt">
): Promise<DishType> {
  try {
    await connectDB();

    if (!data.name || !data.ingredients || data.ingredients.length === 0) {
      throw new Error("Missing required fields");
    }

    const dish = new Dish({
      name: data.name,
      ingredients: data.ingredients,
    });

    await dish.save();
    await dish.populate("ingredients.ingredientId");

    revalidatePath("/table");
    return serialize(dish);
  } catch (error) {
    console.error("Failed to create dish:", error);
    throw new Error("Failed to create dish");
  }
}

export async function updateDish(
  id: string,
  data: Omit<DishType, "_id" | "createdAt" | "updatedAt">
): Promise<DishType> {
  try {
    await connectDB();

    const dish = await Dish.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("ingredients.ingredientId");

    if (!dish) {
      throw new Error("Dish not found");
    }

    revalidatePath("/table");
    return serialize(dish);
  } catch (error) {
    console.error("Failed to update dish:", error);
    throw new Error("Failed to update dish");
  }
}

export async function deleteDish(id: string): Promise<void> {
  try {
    await connectDB();

    const result = await Dish.findByIdAndDelete(id);

    if (!result) {
      throw new Error("Dish not found");
    }

    revalidatePath("/table");
  } catch (error) {
    console.error("Failed to delete dish:", error);
    throw new Error("Failed to delete dish");
  }
}
