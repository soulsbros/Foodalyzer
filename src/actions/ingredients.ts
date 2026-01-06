"use server";

import connectDB from "@/lib/db";
import { serialize } from "@/lib/utils";
import Ingredient from "@/models/Ingredient";
import { Ingredient as IngredientType } from "@/types";
import { revalidatePath } from "next/cache";

export async function getIngredients(): Promise<IngredientType[]> {
  try {
    await connectDB();
    const ingredients = await Ingredient.find().sort({ name: 1 });
    return serialize(ingredients);
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    throw new Error("Failed to fetch ingredients");
  }
}

export async function createIngredient(
  data: Omit<IngredientType, "_id" | "createdAt" | "updatedAt">
): Promise<IngredientType> {
  try {
    await connectDB();

    if (!data.name || data.calories === undefined || !data.category) {
      throw new Error("Missing required fields");
    }

    const ingredient = new Ingredient(data);

    await ingredient.save();
    revalidatePath("/pantry");
    return serialize(ingredient);
  } catch (error) {
    console.error("Failed to create ingredient:", error);
    throw new Error("Failed to create ingredient");
  }
}

export async function updateIngredient(
  id: string,
  data: Omit<IngredientType, "_id" | "createdAt" | "updatedAt">
): Promise<IngredientType> {
  try {
    await connectDB();

    const ingredient = await Ingredient.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    revalidatePath("/pantry");
    return serialize(ingredient);
  } catch (error) {
    console.error("Failed to update ingredient:", error);
    throw new Error("Failed to update ingredient");
  }
}

export async function deleteIngredient(id: string): Promise<void> {
  try {
    await connectDB();

    const result = await Ingredient.findByIdAndDelete(id);

    if (!result) {
      throw new Error("Ingredient not found");
    }

    revalidatePath("/pantry");
  } catch (error) {
    console.error("Failed to delete ingredient:", error);
    throw new Error("Failed to delete ingredient");
  }
}
