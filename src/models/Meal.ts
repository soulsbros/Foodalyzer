import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    dishes: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
      },
    ],
    isShared: {
      type: Boolean,
      default: false,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Meal || mongoose.model("Meal", mealSchema);
