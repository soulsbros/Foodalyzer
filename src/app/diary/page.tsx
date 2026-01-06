"use client";

import { getMealsByDate } from "@/actions/meals";
import { Input } from "@/components/Input";
import { Dish, Ingredient, Meal } from "@/types";
import { useEffect, useState } from "react";

interface CalorieBreakdown {
  category: string;
  calories: number;
}

interface MealBreakdown {
  mealType: string;
  calories: number;
}

export default function DiaryPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, [date]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const data = await getMealsByDate(date);
      setMeals(data);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCaloriesByCategory = (): CalorieBreakdown[] => {
    const breakdown: { [key: string]: number } = {};

    meals.forEach((meal) => {
      meal.dishes.forEach((dish) => {
        const dishData = dish.dishId as unknown as Dish;
        dishData.ingredients.forEach((ing) => {
          const ingredient = ing.ingredientId as unknown as Ingredient;
          const calories = (ingredient.calories * ing.weight) / 100;
          breakdown[ingredient.category] =
            (breakdown[ingredient.category] || 0) + calories;
        });
      });
    });

    return Object.entries(breakdown)
      .map(([category, calories]) => ({ category, calories }))
      .sort((a, b) => b.calories - a.calories);
  };

  const calculateCaloriesByMeal = (): MealBreakdown[] => {
    const breakdown: { [key: string]: number } = {};

    meals.forEach((meal) => {
      const mealType = meal.mealType;
      let mealCalories = 0;

      meal.dishes.forEach((dish) => {
        const dishData = dish.dishId as unknown as Dish;
        dishData.ingredients.forEach((ing) => {
          const ingredient = ing.ingredientId as unknown as Ingredient;
          mealCalories += (ingredient.calories * ing.weight) / 100;
        });
      });

      breakdown[mealType] = (breakdown[mealType] || 0) + mealCalories;
    });

    return Object.entries(breakdown)
      .map(([mealType, calories]) => ({ mealType, calories }))
      .sort((a, b) => b.calories - a.calories);
  };

  const totalCalories = meals.reduce((total, meal) => {
    let mealTotal = 0;
    meal.dishes.forEach((dish) => {
      const dishData = dish.dishId as unknown as Dish;
      dishData.ingredients.forEach((ing) => {
        const ingredient = ing.ingredientId as unknown as Ingredient;
        mealTotal += (ingredient.calories * ing.weight) / 100;
      });
    });
    return total + mealTotal;
  }, 0);

  const caloriesByCategory = calculateCaloriesByCategory();
  const caloriesByMeal = calculateCaloriesByMeal();

  const maxCategoryCalories = Math.max(
    ...caloriesByCategory.map((c) => c.calories),
    1
  );
  const maxMealCalories = Math.max(...caloriesByMeal.map((m) => m.calories), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-emerald-400 mb-8">Diary</h1>

      {/* Date Picker */}
      <div className="mb-8 max-w-xs">
        <Input
          label="Select Date"
          type="date"
          value={date}
          onChange={(value) => setDate(value as string)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-300">Loading meals...</p>
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <p className="text-slate-300">No meals logged for this date</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Summary */}
          <div className="md:col-span-3 bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">
              Daily Summary
            </h2>
            <div className="text-center">
              <p className="text-slate-300 mb-2">Total Daily Calories</p>
              <p className="text-5xl font-bold text-emerald-400">
                {totalCalories.toFixed(1)}
              </p>
              <p className="text-sm text-slate-400 mt-2">kcal</p>
            </div>
          </div>

          {/* Calories by Meal Type */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-emerald-400 mb-6">
              By Meal Type
            </h3>
            <div className="space-y-4">
              {caloriesByMeal.length === 0 ? (
                <p className="text-slate-400">No meal data</p>
              ) : (
                caloriesByMeal.map((meal) => (
                  <div key={meal.mealType}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 capitalize font-medium">
                        {meal.mealType}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {meal.calories.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(meal.calories / maxMealCalories) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calories by Category */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-emerald-400 mb-6">
              By Category
            </h3>
            <div className="space-y-4">
              {caloriesByCategory.length === 0 ? (
                <p className="text-slate-400">No category data</p>
              ) : (
                caloriesByCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 font-medium">
                        {cat.category}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {cat.calories.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (cat.calories / maxCategoryCalories) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pie Chart Representation */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-emerald-400 mb-6">
              Distribution
            </h3>
            <div className="space-y-3">
              {caloriesByCategory.map((cat, idx) => {
                const colors = [
                  "bg-emerald-500",
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-pink-500",
                  "bg-orange-500",
                  "bg-yellow-500",
                  "bg-red-500",
                  "bg-indigo-500",
                ];
                const percentage = (
                  (cat.calories / totalCalories) *
                  100
                ).toFixed(1);
                return (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        colors[idx % colors.length]
                      }`}
                    />
                    <span className="text-sm text-slate-300">
                      {cat.category}: {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Meals */}
      {meals.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6">
            Meals Detail
          </h2>
          <div className="grid gap-6">
            {meals.map((meal) => {
              const mealCalories = meal.dishes.reduce((total, dish) => {
                const dishData = dish.dishId as unknown as Dish;
                const dishCalories = dishData.ingredients.reduce((sum, ing) => {
                  const ingredient = ing.ingredientId as unknown as Ingredient;
                  return sum + (ingredient.calories * ing.weight) / 100;
                }, 0);
                return total + dishCalories;
              }, 0);

              return (
                <div
                  key={meal._id}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-400 capitalize">
                        {meal.mealType}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {new Date(meal.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {meal.isShared ? "🤝 Shared meal" : "👤 Your meal"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total:</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {mealCalories.toFixed(1)} kcal
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {meal.dishes.map((dish, idx) => {
                      const dishData = dish.dishId as unknown as Dish;
                      return (
                        <div key={idx} className="bg-slate-700 rounded p-4">
                          <div className="grid gap-2 text-sm">
                            {dishData.ingredients.map((ing, ingIdx) => {
                              const ingredient =
                                ing.ingredientId as unknown as Ingredient;
                              const calories =
                                (ingredient.calories * ing.weight) / 100;
                              return (
                                <div
                                  key={ingIdx}
                                  className="flex justify-between text-slate-300"
                                >
                                  <span>
                                    {ingredient.name} ({ingredient.category}) ·{" "}
                                    {ing.weight}g
                                  </span>
                                  <span className="font-semibold text-emerald-400">
                                    {calories.toFixed(1)} kcal
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
