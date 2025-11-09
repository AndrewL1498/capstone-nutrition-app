import mongoose from "mongoose";
import { connect } from "../dbConfig/dbConfig";
import User from "../models/userModel";
import 'dotenv/config';


connect();

const MONGO_URL = process.env.MONGO_URL!;

async function updateUsers() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    const UsersTest = mongoose.model("UsersTest", User.schema, "users_test");

    // Update all users that do not have userDetails, mealPlan, etc.
    const result = await UsersTest.updateMany(
      { 
        $or: [ // Update only if any of the fields are missing
          { userDetails: { $exists: false } },
          { mealPlan: { $exists: false } },
          { mealPlanStatus: { $exists: false } },
          { mealPlanGeneratedAt: { $exists: false } },
        ]
      },
      {
        $set: { // Set default values for the new fields
          userDetails: {
            diet: "",
            healthPrefs: [],
            calories: 2000,
            sections: {
              Breakfast: { dishes: [], meals: ["breakfast"] },
              Lunch: { dishes: [], meals: ["lunch/dinner"] },
              Dinner: { dishes: [], meals: ["lunch/dinner"] },
            },
          },
          mealPlan: [],
          mealPlanStatus: "NONE",
          mealPlanGeneratedAt: null,
        }
      }
    );

    console.log(`Users updated: ${result.modifiedCount}`);
    process.exit(0); // Exit successfully. The number is an optional exit code.
  } catch (err) {
    console.error("Error updating users:", err);
    process.exit(1); // Exit with failure. The number is an optional exit code.
  }
}

updateUsers();
