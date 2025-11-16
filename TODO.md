1. Add ability for user to pick if they want to add a or remove a meal like breakfast/lunch/dinner

2. update middleware if neccessary after creating new files and routes

3. Add useEffect re-fetch of images in the mealPlan page:

 useEffect(() => {
    const refreshMealImages = async () => {
      if (!user) return;

      const oneHour = 1000 * 60 * 60;
      const lastGenerated = new Date(user.mealPlanGeneratedAt || 0);

      // Only refresh if meal plan is older than 1 hour
      if (Date.now() - lastGenerated.getTime() < oneHour) return;

      try {
        const updatedPlan = await Promise.all(
          user.mealPlan.map(async (day) => {
            const updatedSections: any = {};

            for (const mealType of ["Breakfast", "Lunch", "Dinner"]) {
              const meal = day.sections[mealType as keyof typeof day.sections];

              if (!meal || !meal.label) {
                updatedSections[mealType] = meal;
                continue;
              }

              // Call a backend route to re-fetch Edamam data for the same recipe label
              // (You’ll need to create this /api/edamam route)
              const edamamRes = await axios.get("/api/edamam", {
                params: { label: meal.label },
              });

              const freshMeal = edamamRes.data;

              updatedSections[mealType] = {
                ...meal,
                image: freshMeal.image,
                url: freshMeal.url,
              };
            }

            return { sections: updatedSections };
          })
        );

        setUser({ ...user, mealPlan: updatedPlan });
      } catch (err) {
        console.error("Failed to refresh meal images:", err);
      }
    };

    refreshMealImages();
  }, [user]);

  console.log("User Data:", user);




  /////THIS WOULD BE THE BACKENd ROUTE PROVIDED BELOW TO MAKE THIS WORK://///////






  // /app/api/edamam/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const label = searchParams.get("label");

  if (!label) {
    return NextResponse.json({ error: "Label required" }, { status: 400 });
  }

  try {
    const res = await axios.get("https://api.edamam.com/api/recipes/v2", {
      params: {
        type: "public",
        q: label,
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
      },
    });

    const recipe = res.data.hits?.[0]?.recipe;

    return NextResponse.json({
      label: recipe.label,
      image: recipe.image,
      url: recipe.url,
      calories: recipe.calories,
      cuisineType: recipe.cuisineType,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch from Edamam" },
      { status: 500 }
    );
  }
}

4. Add Navbar ✅

5. Go over meal plan page and meal details page code ✅

6. See if anything can be done about meals not showing up

7. see if you can get a more accurate calorie count/estimate on meals and add the servings to the meals ✅

8. create universal error handling (possibly optional)

9. set loading on user details and update front end ✅

10. delete extra profile page

11. update styling on profile page

12. make loading screen look better when switching to the meal plan