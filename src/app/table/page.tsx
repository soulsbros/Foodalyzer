"use client";

import { createDish } from "@/actions/dishes";
import { getIngredients } from "@/actions/ingredients";
import { createMeal, deleteMeal, getMealsByDate } from "@/actions/meals";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Dish, Ingredient, Meal, MealType } from "@/types";
import { useEffect, useState } from "react";

interface DishEntry {
  ingredientId: string;
  weight: number;
  caloriePer100g: number;
  totalCalories: number;
}

export default function TablePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mealType, setMealType] = useState("lunch");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dishEntries, setDishEntries] = useState<DishEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMealsForDate();
  }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealsForDate = async () => {
    try {
      const data = await getMealsByDate(date);
      setMeals(data);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    }
  };

  const handleAddIngredient = () => {
    setDishEntries([
      ...dishEntries,
      { ingredientId: "", weight: 100, caloriePer100g: 0, totalCalories: 0 },
    ]);
  };

  const handleUpdateEntry = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newEntries = [...dishEntries];
    const entry = newEntries[index];

    if (field === "ingredientId") {
      const ingredient = ingredients.find((i) => i._id === value);
      if (ingredient) {
        entry.ingredientId = value as string;
        entry.caloriePer100g = ingredient.calories;
        // Use the ingredient's serving size as the default weight
        entry.weight = ingredient.servingSize || 100;
        entry.totalCalories = (entry.weight * ingredient.calories) / 100;
      }
    } else if (field === "weight") {
      entry.weight = value as number;
      entry.totalCalories = (entry.weight * entry.caloriePer100g) / 100;
    }

    newEntries[index] = entry;
    setDishEntries(newEntries);
  };

  const handleRemoveEntry = (index: number) => {
    setDishEntries(dishEntries.filter((_, i) => i !== index));
  };

  const handleSaveMeal = async () => {
    if (dishEntries.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    if (dishEntries.some((entry) => !entry.ingredientId)) {
      alert("Please select an ingredient for all entries");
      return;
    }

    try {
      // First, create dishes for each ingredient in the meal
      const dishPromises = dishEntries.map((entry) =>
        createDish({
          name: `${date} - ${mealType}`,
          ingredients: [
            {
              ingredientId: entry.ingredientId,
              weight: entry.weight,
            },
          ],
        })
      );

      const dishes = await Promise.all(dishPromises);
      const dishIds = dishes.map((dish) => ({
        dishId: dish._id,
      }));

      // Then create the meal
      await createMeal({
        date,
        mealType: mealType as MealType,
        dishes: dishIds,
      });

      // Reset form
      setDishEntries([]);
      await fetchMealsForDate();
    } catch (error) {
      console.error("Failed to save meal:", error);
      alert("Failed to save meal");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;

    try {
      await deleteMeal(mealId);
      await fetchMealsForDate();
    } catch (error) {
      console.error("Failed to delete meal:", error);
      alert("Failed to delete meal");
    }
  };

  const totalCalories = dishEntries.reduce(
    (sum, entry) => sum + entry.totalCalories,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-emerald-400 mb-8">The Table</h1>

      {/* Date and Meal Type Selection */}
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(value) => setDate(value as string)}
          />
          <Select
            label="Meal Type"
            options={mealTypes}
            value={mealType}
            onChange={(value) => setMealType(value as string)}
          />
        </div>

        {/* Ingredient Entry */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">
            Add Ingredients
          </h2>
          {loading ? (
            <p className="text-slate-300">Loading ingredients...</p>
          ) : ingredients.length === 0 ? (
            <p className="text-slate-400">
              No ingredients in pantry. Please add some in The Pantry first.
            </p>
          ) : (
            <>
              {dishEntries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4"
                >
                  <Select
                    label="Ingredient"
                    options={ingredients.map((ing) => ({
                      value: ing._id,
                      label: `${ing.name} (${ing.calories} kcal/100g)`,
                    }))}
                    value={entry.ingredientId}
                    onChange={(value) =>
                      handleUpdateEntry(index, "ingredientId", value)
                    }
                  />
                  <Input
                    label="Weight (g)"
                    type="number"
                    value={entry.weight}
                    onChange={(value) =>
                      handleUpdateEntry(index, "weight", value)
                    }
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">
                      kcal/100g
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-slate-600 text-slate-300">
                      {entry.caloriePer100g}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">
                      Total Calories
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-emerald-900 text-emerald-300 font-semibold">
                      {entry.totalCalories.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveEntry(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleAddIngredient}
                variant="secondary"
                className="mb-6"
              >
                + Add Ingredient
              </Button>

              {dishEntries.length > 0 && (
                <div className="bg-slate-700 rounded-lg p-4 mb-6">
                  <div className="text-right">
                    <p className="text-slate-300">Meal Total:</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {totalCalories.toFixed(1)} kcal
                    </p>
                  </div>
                </div>
              )}

              {dishEntries.length > 0 && (
                <Button onClick={handleSaveMeal} className="w-full">
                  Save Meal
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Today's Meals */}
      <div>
        <h2 className="text-2xl font-bold text-emerald-400 mb-4">Meals list</h2>
        {meals.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <p className="text-slate-300">No meals logged for this date yet.</p>
          </div>
        ) : (
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
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total:</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {mealCalories.toFixed(1)} kcal
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {meal.dishes.map((dish, idx) => {
                      const dishData = dish.dishId as unknown as Dish;
                      return (
                        <div key={idx} className="text-sm text-slate-300">
                          {dishData.ingredients.map((ing, ingIdx) => {
                            const ingredient =
                              ing.ingredientId as unknown as Ingredient;
                            const calories =
                              (ingredient.calories * ing.weight) / 100;
                            return (
                              <p key={ingIdx}>
                                {ingredient.name}: {ing.weight}g (
                                {calories.toFixed(1)} kcal)
                              </p>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMeal(meal._id)}
                    className="w-full"
                  >
                    Delete Meal
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
