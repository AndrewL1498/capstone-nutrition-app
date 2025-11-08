import mongoose from "mongoose";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect();

const MONGO_URL = process.env.MONGO_URL

async function updateUsers() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Update all users that do not have userDetails, mealPlan, etc.
    const result = await User.updateMany(
      { 
        $or: [
          { userDetails: { $exists: false } },
          { mealPlan: { $exists: false } },
          { mealPlanStatus: { $exists: false } },
          { mealPlanGeneratedAt: { $exists: false } },
        ]
      },
      {
        $set: {
          userDetails: {
            diet: "",
            healthPrefs: [],
            calories: 2000,
            sections: {
                Breakfast: { dishes: { type: [String], default: () => [] }, meals: { type: [String], default: () => ["breakfast"] } },
                Lunch: { dishes: { type: [String], default: () => [] }, meals: { type: [String], default: () => ["lunch/dinner"] } },
                Dinner: { dishes: { type: [String], default: () => [] }, meals: { type: [String], default: () => ["lunch/dinner"] } },
            },
          },
          mealPlan: [],
          mealPlanStatus: "NONE",
          mealPlanGeneratedAt: null,
        }
      }
    );

    console.log(`Users updated: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating users:", err);
    process.exit(1);
  }
}

updateUsers();
