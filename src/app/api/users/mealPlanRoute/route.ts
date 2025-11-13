// // /app/api/mealPlan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect(); // Ensure DB connection is established

const MEAL_PLANNER_APP_ID = process.env.MEAL_PLANNER_APP_ID; // e.g. c4cf182d
const MEAL_PLANNER_APP_KEY = process.env.MEAL_PLANNER_APP_KEY; // your secret key

const RECIPE_SEARCH_ID = process.env.RECIPE_SEARCH_ID;
const RECIPE_SEARCH_KEY = process.env.RECIPE_SEARCH_KEY;

export async function POST(req: NextRequest) {
  try {
    const userId = await getDataFromToken(req);
    const accountUser = userId; // fallback to default
    const {
          healthPrefs,
          calories,
          sections,
          breakfastMin,
          breakfastMax,
          lunchMin,
          lunchMax,
          dinnerMin,
          dinnerMax } = await req.json();

    // ✅ Build your request body (same as your curl example)
    const body = {
      size: 7,
      plan: {
          accept: {
            all: [
              ...(healthPrefs && healthPrefs.length > 0 // Only include the health filter if there are selected preferences for health prefs
                ? [{ health: healthPrefs }]
                : []),
            ],
          },
        fit: {
      ENERC_KCAL: {
        min: calories?.min || 1000,
        max: calories?.max || 2000
      }
        },
        exclude: [
          "http://www.edamam.com/ontologies/edamam.owl#recipe_x",
          "http://www.edamam.com/ontologies/edamam.owl#recipe_y",
          "http://www.edamam.com/ontologies/edamam.owl#recipe_z",
        ],
        sections: {
          Breakfast: {
            accept: {
              all: [
            { dish: sections?.Breakfast?.dishes || [] },
            { meal: sections?.Breakfast?.meals || [] },
              ],
            },
            fit: { ENERC_KCAL: { min: breakfastMin, max: breakfastMax } },
          },
          Lunch: {
            accept: {
              all: [
                { dish: sections?.Lunch?.dishes || [] },
                { meal: sections?.Lunch?.meals || [] }
              ],
            },
            fit: { ENERC_KCAL: { min: lunchMin, max: lunchMax } },
          },
          Dinner: {
            accept: {
              all: [
                { dish: sections?.Dinner?.dishes || [] },
                { meal: sections?.Dinner?.meals || [] }
              ],
            },
            fit: { ENERC_KCAL: { min: dinnerMin, max: dinnerMax} },
          },
        },
      },
    };

    // ✅ Build Basic Auth header
    const mealPlannerAuth = `Basic ${Buffer.from(
      `${MEAL_PLANNER_APP_ID}:${MEAL_PLANNER_APP_KEY}`
    ).toString("base64")}`;

    // ✅ Send request to Edamam
    const mealPlannerResponse = await fetch(
      `https://api.edamam.com/api/meal-planner/v1/${MEAL_PLANNER_APP_ID}/select?type=public`,
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": mealPlannerAuth,
          "Edamam-Account-User": accountUser,
        },
        body: JSON.stringify(body),
      }
    );

    const plannerData = await mealPlannerResponse.json();


// ✅ 1. Handle network or HTTP-level errors
if (!mealPlannerResponse.ok) {
  console.error("Edamam API network error:", plannerData);
  return NextResponse.json(
    { success: false, message: "Api error occurred while fetching meal plan." },
  );
}

// ✅ 2. Handle Edamam returning a valid response but with an unsuccessful status
if (plannerData.status !== "OK") {
  return NextResponse.json(
    { success: false, message: "No matching recipes found for your preferences. Please try again." },
  );
}

 const enhancedMealPlan = await Promise.all(
      plannerData.selection.map(async (day: any) => { // .selection is an array of days/objects that is displayed on the backend. We set day to any to avoid TS errors
        const enhancedSections: any = {}; // will hold the enhanced meal data for Breakfast, Lunch, Dinner

        for (const [mealName, meal] of Object.entries(day.sections)) { //destructures day.sections into mealName (Breakfast, Lunch, Dinner) and meal (the meal object)
          const recipeUri = (meal as any).assigned; // assigned the recipe URI. Type is set to any because the value of meal.assigned could be anything; an array, string, object, etc.
          const recipeId = recipeUri?.split("#recipe_")[1]; // Question mark is saying to only try to split if recipeUri is defined. Split splits the string into an array at the point where "#recipe_" occurs and takes the second part [1] which is the actual recipe ID

          if (!recipeId) {
            enhancedSections[mealName] = { assigned: recipeUri }; //If key is a variable you have to use bracket notation to set the value. This runs for every loop if there is no recipeId
            continue; // skip to the next iteration of the for loop instead of executing the rest of the code in this loop
          }

          

          try {
            console.log(`Fetching recipe for day, meal type: ${mealName}, recipeId:`, recipeId);

            const recipeResponse = await fetch( // Recipe API works best without Auth header because it's public data
              `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${RECIPE_SEARCH_ID}&app_key=${RECIPE_SEARCH_KEY}`,
              { 
                method: "GET",
                headers: { accept: "application/json" }
              }
            );


            const recipeData = await recipeResponse.json();
            console.log(`Recipe data returned for ${mealName}, ID ${recipeId}:`, recipeData);

            if (!recipeData?.recipe) { // if recipeData or recipeData.recipe is null or undefined...
            console.warn(`Recipe data not found for recipeId ${recipeId}. Skipping...`); // then log a warning for missing recipe data...
            enhancedSections[mealName] = { assigned: recipeUri }; // then set the assigned URI only...
            continue; // And skip to the next iteration of the for loop
}

            const totalCalories = recipeData.recipe.calories; // total for recipe
            const servings = recipeData.recipe.yield || 1;    // number of servings (fallback 1)
            const caloriesPerServing = totalCalories / servings; // calculate per serving

            const nutrientsPerServing: Record<string, { quantity: number; unit: string }> = {}; // record is a typescript type meaning an object with string keys and values of the specified type

            for (const [key, value] of Object.entries(recipeData.recipe.totalNutrients as Record<string, { quantity: number; unit: string }>)) { // destructure totalNutrients into key and value pairs
              nutrientsPerServing[key] = { // Assign key value pairs and store in nutrientsPerServing object
                quantity: value.quantity / servings,
                unit: value.unit,
              };
            }


            if (recipeData?.recipe) { // optional chaining to check if recipeData and recipeData.recipe exist and are not null or undefined
              enhancedSections[mealName] = {
                assigned: recipeUri,
                label: recipeData.recipe.label,
                image: recipeData.recipe.image,
                url: recipeData.recipe.url,
                totalCalories: totalCalories,
                caloriesPerServing: caloriesPerServing,
                cuisineType: recipeData.recipe.cuisineType,
                ingredients: recipeData.recipe.ingredientLines,
                nutrients: nutrientsPerServing,
                servings: servings,
              };
            } else {
              enhancedSections[mealName] = { assigned: recipeUri };
            }
          } catch (err) {
            console.error("Error fetching recipe details:", err);
            enhancedSections[mealName] = { assigned: recipeUri, error: "Usage Limits Exceeded" };
          }
        }
        return { sections: enhancedSections };
      })
    );

// Save to database
await User.findByIdAndUpdate(
  userId,
  {
    "userDetails.healthPrefs": healthPrefs,
    "userDetails.calories.min": calories.min,
    "userDetails.calories.max": calories.max,
    "userDetails.sections": sections,
    mealPlan: enhancedMealPlan,
    mealPlanStatus: "GENERATED",
    mealPlanGeneratedAt: new Date(),
  },
  { new: true }
);



// ✅ 3. Success
return NextResponse.json({
  success: true,
  message: "Meal plan generated successfully!",
  mealPlan: enhancedMealPlan,
});
} catch (error: any) {
  console.error("Meal plan API error:", error);
  return NextResponse.json(
    { success: false, message: "Server error while generating meal plan." },
    { status: 500 }
  );
}
}
