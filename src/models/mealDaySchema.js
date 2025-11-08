import mongoose from "mongoose";
import mealDetailsSchema from "./mealDetailsSchema";

const mealDaySchema = new mongoose.Schema({
  sections: {
    Breakfast: { type: mealDetailsSchema, default: () => ({}) }, // type schema means the field is a sub-document
    Lunch: { type: mealDetailsSchema, default: () => ({}) },
    Dinner: { type: mealDetailsSchema, default: () => ({}) },
  }
});

export default mealDaySchema;
