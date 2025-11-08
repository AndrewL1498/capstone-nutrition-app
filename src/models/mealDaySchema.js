import mongoose from "mongoose";
import mealSectionSchema from "./mealSectionSchema";

const MealDaySchema = new mongoose.Schema({
  sections: {
    Breakfast: { type: mealSectionSchema, default: () => ({}) },
    Lunch: { type: mealSectionSchema, default: () => ({}) },
    Dinner: { type: mealSectionSchema, default: () => ({}) },
  }
});

export default MealDaySchema;
