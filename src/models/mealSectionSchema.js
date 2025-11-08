import mongoose from "mongoose";

const MealSectionSchema = new mongoose.Schema({
  assigned: { type: String, default: "" },   // URI from meal planner
  label: { type: String, default: "" },      // Recipe name
  image: { type: String, default: "" },      // Recipe image URL
  url: { type: String, default: "" },        // Recipe link
  calories: { type: Number, default: 0 },
  cuisineType: { type: [String], default: [] },
  dishes: { type: [String], default: [] },   // user-selected dish names
  meals: { type: [String], default: [] }     // breakfast, lunch, dinner
});

export default MealSectionSchema;
