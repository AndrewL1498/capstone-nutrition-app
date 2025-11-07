// import { NextRequest, NextResponse } from 'next/server';
// import { connect } from '@/dbConfig/dbConfig';

// connect(); // Establishes a connection to the database using the connect function from dbConfig


// const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID; // from your Edamam account
// const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

// export async function POST(req: NextRequest) {
//   try {
//     // Get user preferences from request body
//     const data = await req.json();

//     //destructures the data object to extract size, healthLabels, calories, and sections
//     const {
//       healthPrefs, // array of health labels like ["DAIRY_FREE", "SOY_FREE"]
//       calories,     // object like { min: 1500, max: 2000 }
//       sections,      // object with Breakfast, Lunch, Dinner sections
//       breakfastMin,
//       breakfastMax,
//       lunchMin,
//       lunchMax,
//       dinnerMin,
//       dinnerMax,
//       // selectedMealTypes
//     } = data;

//     // Build request body for Edamam API
// const requestBody = {
//   size: 7, // default 7 days
//   plan: {
//     accept: {
//       all: [
//         {
//           health: healthPrefs || [] // top-level health labels include allergies & diet
//         }
//       ]
//     },
//     fit: {
//       ENERC_KCAL: {
//         min: calories?.min || 1000,
//         max: calories?.max || 2000
//       }
//     },
//     sections: {
//       Breakfast: {
//         accept: {
//           all: [
//             { dish: sections?.Breakfast?.dishes || [] },
//             { meal: sections?.Breakfast?.meals || [] }
//           ]
//         },
//         fit: {
//           ENERC_KCAL: {
//             min: breakfastMin,
//             max: breakfastMax
//           }
//         }
//       },
//       Lunch: {
//         accept: {
//           all: [
//             { dish: sections?.Lunch?.dishes || [] },
//             { meal: sections?.Lunch?.meals || [] }
//           ]
//         },
//         fit: {
//           ENERC_KCAL: {
//             min: lunchMin,
//             max: lunchMax
//           }
//         }
//       },
//       Dinner: {
//         accept: {
//           all: [
//             { dish: sections?.Dinner?.dishes || [] },
//             { meal: sections?.Dinner?.meals || [] }
//           ]
//         },
//         fit: {
//           ENERC_KCAL: {
//             min: dinnerMin,
//             max: dinnerMax
//           }
//         }
//       }
//     }
//   }
// };


// console.log("Request Body for Edamam:", requestBody);

//     // Call Edamam Meal Planner API
//     const response = await fetch(
//       `https://api.edamam.com/api/meal-planner/v1/b26fb46d/select?app_id=b26fb46d&app_key=c887a724df8435d92a76f3ec8b3ba91a`,
//       {
//         method: "POST",
//         headers: { // Set content type to JSON
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody), // Convert requestBody object to JSON string
//       }
//     );

//     if (!response.ok) { //response.ok checks if the response status code is in the range 200-299 because the fetch function does not throw an error for HTTP error statuses
//       const errorText = await response.text(); // Read the response body as text for more detailed error information and it's a safer way to handle non-JSON error responses
//       return NextResponse.json({ error: errorText }, { status: response.status });
//     }

//     const mealPlan = await response.json();
//     return NextResponse.json(mealPlan);

//   } catch (error) {
//     console.error("Meal Planner API Error:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }










// // /api/users/mealPlanRoute.ts
// import { NextRequest, NextResponse } from "next/server";

// const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
// const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

// export async function POST(req: NextRequest) {
//   try {
//     const { healthPrefs, calories, sections } = await req.json();

//     if (!sections || !calories) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // Build the plan object according to Edamam's expected structure
//     const plan = {
//       Breakfast: {
//         calories: { min: Math.floor(calories.min * 0.25), max: Math.floor(calories.max * 0.25) },
//         dishes: sections.Breakfast.dishes,
//         meals: sections.Breakfast.meals
//       },
//       Lunch: {
//         calories: { min: Math.floor(calories.min * 0.35), max: Math.floor(calories.max * 0.35) },
//         dishes: sections.Lunch.dishes,
//         meals: sections.Lunch.meals
//       },
//       Dinner: {
//         calories: { min: Math.floor(calories.min * 0.4), max: Math.floor(calories.max * 0.4) },
//         dishes: sections.Dinner.dishes,
//         meals: sections.Dinner.meals
//       }
//     };

//     // Edamam API expects this structure
// const payload = {
//   size: 7,
//   plan: {
//     accept: {
//       all: [
//         { health: healthPrefs || [] }
//       ]
//     },
//     fit: {
//       ENERC_KCAL: {
//         min: calories?.min || 1000,
//         max: calories?.max || 2000
//       }
//     },
//     sections: {
//       Breakfast: {
//         accept: {
//           all: [
//             { dish: sections.Breakfast.dishes || [] },
//             { meal: sections.Breakfast.meals || [] }
//           ]
//         },
//         fit: {
//           ENERC_KCAL: {
//             min: Math.floor(calories.min * 0.25),
//             max: Math.floor(calories.max * 0.25)
//           }
//         }
//       },
//       Lunch: {
//         accept: {
//           all: [
//             { dish: sections.Lunch.dishes || [] },
//             { meal: sections.Lunch.meals || [] }
//           ]
//         },
//         fit: {
//           ENERC_KCAL: {
//             min: Math.floor(calories.min * 0.35),
//             max: Math.floor(calories.max * 0.35)
//           }
//         }
//       },
//       Dinner: {
//         accept: {
//           all: [
//             { dish: sections.Dinner.dishes || [] },
//             { meal: sections.Dinner.meals || [] }
//           ]
//         },
//         fit: {
//           ENERC_KCAL: {
//             min: Math.floor(calories.min * 0.4),
//             max: Math.floor(calories.max * 0.4)
//           }
//         }
//       }
//     }
//   }
// };


//     const edamamRes = await fetch(
//       `https://api.edamam.com/api/meal-planner/v1/${EDAMAM_APP_ID}/select`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Basic ${Buffer.from(`${EDAMAM_APP_ID}:${EDAMAM_APP_KEY}`).toString("base64")}`
//         },
//         body: JSON.stringify(payload)
//       }
//     );

//     const data = await edamamRes.json();

//     return NextResponse.json(data);
//   } catch (err: any) {
//     console.error("Meal plan API error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }














// // /app/api/mealPlan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID; // e.g. c4cf182d
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY; // your secret key

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
            {
              health: healthPrefs || [],
            },
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
                { meal: ["breakfast"] },
              ],
            },
            fit: { ENERC_KCAL: { min: 100, max: 600 } },
          },
          Lunch: {
            accept: {
              all: [
                {
                  dish: [
                    "main course",
                    "pasta",
                    "egg",
                    "salad",
                    "soup",
                    "sandwiches",
                    "pizza",
                    "seafood",
                  ],
                },
                { meal: ["lunch/dinner"] },
              ],
            },
            fit: { ENERC_KCAL: { min: 300, max: 900 } },
          },
          Dinner: {
            accept: {
              all: [
                {
                  dish: [
                    "seafood",
                    "egg",
                    "salad",
                    "pizza",
                    "pasta",
                    "main course",
                  ],
                },
                { meal: ["lunch/dinner"] },
              ],
            },
            fit: { ENERC_KCAL: { min: 200, max: 900 } },
          },
        },
      },
    };

    // ✅ Build Basic Auth header
    const authHeader = `Basic ${Buffer.from(
      `${EDAMAM_APP_ID}:${EDAMAM_APP_KEY}`
    ).toString("base64")}`;

    // ✅ Send request to Edamam
    const response = await fetch(
      `https://api.edamam.com/api/meal-planner/v1/${EDAMAM_APP_ID}/select?type=public`,
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": authHeader,
          "Edamam-Account-User": accountUser,
        },
        body: JSON.stringify(body),
      }
    );

   console.log(`breakfastMin: ${breakfastMin}, breakfastMax: ${breakfastMax}, lunchMin: ${lunchMin}, lunchMax: ${lunchMax}, dinnerMin: ${dinnerMin}, dinnerMax: ${dinnerMax}`);
   console.log(`caloriesMin: ${calories.min}`, `caloriesMax: ${calories.max}`);
   console.log(`breakfast dishes: ${sections.Breakfast.dishes}, lunch dishes: ${sections.Lunch.dishes}, dinner dishes: ${sections.Dinner.dishes}`);
   console.log(`breakfast meals: ${sections.Breakfast.meals}, lunch meals: ${sections.Lunch.meals}, dinner meals: ${sections.Dinner.meals}`);

    const data = await response.json();

    if (!response.ok) {
      console.error("Edamam API error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Meal plan API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
