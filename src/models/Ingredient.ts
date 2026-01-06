import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    servingSize: {
      type: Number,
      default: 100,
      min: 0.1,
    },
    store: {
      type: String,
      required: true,
      default: "Unknown",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Ingredient ||
  mongoose.model("Ingredient", ingredientSchema);
