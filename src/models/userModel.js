import mongoose from "mongoose";
import mealSectionSchema from "./mealSectionSchema";
import mealDaySchema from "./mealDaySchema";

const userSchema = new mongoose.Schema({
    username: { type: String, 
        required: [true, "Please provide a username"],
        unique: true, 
    },
    email: { 
        type: String,
        required: [true, "Please provide a email"],
        unique: true,
    },
    password: { 
        type: String,
        required: [true, "Please provide a password"] 
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,

userDetails: {
  diet: { type: String, default: "" },
  healthPrefs: { type: [String], default: [] },
  calories: { type: Number, default: 2000 },
  
  // Add sections directly here
  sections: {
      Breakfast: { type: mealSectionSchema, default: () => ({ meals: ["breakfast"] }) },
      Lunch: { type: mealSectionSchema, default: () => ({ meals: ["lunch/dinner"] }) },
      Dinner: { type: mealSectionSchema, default: () => ({ meals: ["lunch/dinner"] }) },
  },
},


  // Last generated meal plan
  mealPlan: { type: [MealDaySchema], default: [] },
  mealPlanStatus: { type: String, default: "NONE" },
  mealPlanGeneratedAt: { type: Date }

})

const User = mongoose.models.User || mongoose.model("User", userSchema); // if model already exists, use it. Otherwise, create a new model called "users".

export default User;