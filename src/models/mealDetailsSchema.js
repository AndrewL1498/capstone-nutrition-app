import mongoose from "mongoose";

const mealDetailsSchema = new mongoose.Schema({
  assigned: { type: String, default: "" },   // URI from meal planner
  label: { type: String, default: "" },      // Recipe name
  image: { type: String, default: "" },      // Recipe image URL
  url: { type: String, default: "" },        // Recipe link
  caloriesPerServing: { type: Number, default: 0 }, // Calories per serving
  totalCalories: { type: Number, default: 0 },      // Total calories for the recipe
  cuisineType: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  nutrients: { type: mongoose.Schema.Types.Mixed, default: {} },
  servings: { type: Number, default: 1 },
});

export default mealDetailsSchema;
