import mongoose from "mongoose";

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
    Breakfast: {
      dishes: { type: [String], default: [] },
      meals: { type: [String], default: ["breakfast"] },
    },
    Lunch: {
      dishes: { type: [String], default: [] },
      meals: { type: [String], default: ["lunch/dinner"] },
    },
    Dinner: {
      dishes: { type: [String], default: [] },
      meals: { type: [String], default: ["lunch/dinner"] },
    },
  },
},


  // ✅ Last generated meal plan
  mealPlan: {
    selection: [
      {
        label: String,
        calories: Number,
        image: String,
        url: String,
      },
    ],
    status: { type: String, default: "NONE" },
    generatedAt: { type: Date },
  },
})

const User = mongoose.models.User || mongoose.model("User", userSchema); // if model already exists, use it. Otherwise, create a new model called "users".

export default User;