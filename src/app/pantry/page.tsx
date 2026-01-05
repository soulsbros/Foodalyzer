"use client";

import {
  createIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from "@/actions/ingredients";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Ingredient } from "@/types";
import { useEffect, useState } from "react";

export default function PantryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    calories: 0,
    category: "",
    description: "",
    servingSize: 100,
  });

  const categories = [
    "Beverages",
    "Condiments",
    "Dairy",
    "Fruits",
    "Grains",
    "Proteins",
    "Sauces",
    "Snacks",
    "Vegetables",
    "Other",
  ];

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.calories || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.servingSize || formData.servingSize <= 0) {
      alert("Serving size must be greater than 0");
      return;
    }

    try {
      if (editingId) {
        await updateIngredient(editingId, formData);
      } else {
        await createIngredient(formData);
      }
      setFormData({
        name: "",
        calories: 0,
        category: "",
        description: "",
        servingSize: 100,
      });
      setEditingId(null);
      setShowForm(false);
      await fetchIngredients();
    } catch (error) {
      console.error("Failed to save ingredient:", error);
      alert("Failed to save ingredient");
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      calories: ingredient.calories,
      category: ingredient.category,
      description: ingredient.description || "",
      servingSize: ingredient.servingSize || 100,
    });
    setEditingId(ingredient._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?"))
      return;

    try {
      await deleteIngredient(id);
      await fetchIngredients();
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
      alert("Failed to delete ingredient");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-400">The Pantry</h1>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              calories: 0,
              category: "",
              description: "",
              servingSize: 100,
            });
          }}
        >
          {showForm ? "Cancel" : "Add Ingredient"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6">
            {editingId ? "Edit Ingredient" : "Add New Ingredient"}
          </h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <Input
              label="Ingredient Name"
              placeholder="e.g., Chicken Breast"
              value={formData.name}
              onChange={(value) =>
                setFormData({ ...formData, name: value as string })
              }
              required
            />
            <Input
              label="Calories (kcal/100g)"
              type="number"
              placeholder="0"
              value={formData.calories}
              onChange={(value) =>
                setFormData({ ...formData, calories: value as number })
              }
              required
            />
            <Select
              label="Category"
              options={categories.map((cat) => ({
                value: cat,
                label: cat,
              }))}
              value={formData.category}
              onChange={(value) =>
                setFormData({ ...formData, category: value as string })
              }
              required
            />
            <Input
              label="Typical Serving Size (g)"
              type="number"
              placeholder="e.g., 100"
              value={formData.servingSize}
              onChange={(value) =>
                setFormData({ ...formData, servingSize: value as number })
              }
              required
            />
            <Input
              label="Description (optional)"
              placeholder="e.g., skinless, grilled"
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value as string })
              }
            />
            <div className="md:col-span-2 flex gap-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    calories: 0,
                    category: "",
                    description: "",
                    servingSize: 100,
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingId ? "Update Ingredient" : "Add Ingredient"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Ingredients List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-300">Loading ingredients...</p>
        </div>
      ) : ingredients.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <p className="text-slate-300 mb-4">
            No ingredients yet. Start by adding one!
          </p>
          <Button onClick={() => setShowForm(true)}>
            Add Your First Ingredient
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient._id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  {ingredient.name}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span>📁 {ingredient.category}</span>
                  <span>🔥 {ingredient.calories} kcal/100g</span>
                  <span>🥄 {ingredient.servingSize || 100}g serving</span>
                  {ingredient.description && (
                    <span>📝 {ingredient.description}</span>
                  )}
                </div>
                <p className="text-xs text-emerald-400 mt-2 font-semibold">
                  {(
                    (ingredient.calories * (ingredient.servingSize || 100)) /
                    100
                  ).toFixed(0)}{" "}
                  kcal per serving
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(ingredient)}
                  className="px-3 py-1 text-sm"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(ingredient._id)}
                  className="px-3 py-1 text-sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
