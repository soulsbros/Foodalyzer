"use server";

import connectDB from "@/lib/db";
import { serialize } from "@/lib/utils";
import Meal from "@/models/Meal";
import { Meal as MealType } from "@/types";
import { revalidatePath } from "next/cache";

export async function getMealsByDate(date: string): Promise<MealType[]> {
  try {
    await connectDB();

    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const meals = await Meal.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .populate({
        path: "dishes.dishId",
        populate: {
          path: "ingredients.ingredientId",
        },
      })
      .sort({ date: -1, mealType: 1 });

    return serialize(meals);
  } catch (error) {
    console.error("Failed to fetch meals:", error);
    throw new Error("Failed to fetch meals");
  }
}

export async function createMeal(
  data: Omit<MealType, "_id" | "createdAt" | "updatedAt">
): Promise<MealType> {
  try {
    await connectDB();

    if (
      !data.date ||
      !data.mealType ||
      !data.dishes ||
      data.dishes.length === 0
    ) {
      throw new Error("Missing required fields");
    }

    const meal = new Meal({
      date: new Date(data.date),
      mealType: data.mealType,
      dishes: data.dishes,
    });

    await meal.save();
    await meal.populate({
      path: "dishes.dishId",
      populate: {
        path: "ingredients.ingredientId",
      },
    });

    revalidatePath("/table");
    revalidatePath("/diary");
    return serialize(meal);
  } catch (error) {
    console.error("Failed to create meal:", error);
    throw new Error("Failed to create meal");
  }
}

export async function updateMeal(
  id: string,
  data: Partial<Omit<MealType, "_id" | "createdAt" | "updatedAt">>
): Promise<MealType> {
  try {
    await connectDB();

    const meal = await Meal.findByIdAndUpdate(id, data, {
      new: true,
    }).populate({
      path: "dishes.dishId",
      populate: {
        path: "ingredients.ingredientId",
      },
    });

    if (!meal) {
      throw new Error("Meal not found");
    }

    revalidatePath("/table");
    revalidatePath("/diary");
    return serialize(meal);
  } catch (error) {
    console.error("Failed to update meal:", error);
    throw new Error("Failed to update meal");
  }
}

export async function deleteMeal(id: string): Promise<void> {
  try {
    await connectDB();

    const result = await Meal.findByIdAndDelete(id);

    if (!result) {
      throw new Error("Meal not found");
    }

    revalidatePath("/table");
    revalidatePath("/diary");
  } catch (error) {
    console.error("Failed to delete meal:", error);
    throw new Error("Failed to delete meal");
  }
}
