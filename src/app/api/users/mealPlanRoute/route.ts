import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';

connect(); // Establishes a connection to the database using the connect function from dbConfig


const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID; // from your Edamam account
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

export async function POST(req: NextRequest) {
  try {
    // Get user preferences from request body
    const data = await req.json();

    //destructures the data object to extract size, healthLabels, calories, and sections
    const {
      size,
      healthLabels, // array of health labels like ["DAIRY_FREE", "SOY_FREE"]
      calories,     // object like { min: 1500, max: 2000 }
      sections      // object with Breakfast, Lunch, Dinner sections
    } = data;

    // Build request body for Edamam API
    const requestBody = {
      size: size || 7, // default 7 days
      plan: {
        accept: {
          all: [
            {
              health: healthLabels || []
            }
          ]
        },
        fit: {
          ENERC_KCAL: {
            min: calories?.min || 1000,
            max: calories?.max || 2000
          }
        },
        sections: sections || {} // use sections provided or empty object
      }
    };

    // Call Edamam Meal Planner API
    const response = await fetch(
      `https://api.edamam.com/api/meal-planner/v1/${EDAMAM_APP_ID}/select?app_key=${EDAMAM_APP_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) { //response.ok checks if the response status code is in the range 200-299 because the fetch function does not throw an error for HTTP error statuses
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const mealPlan = await response.json();
    return NextResponse.json(mealPlan);

  } catch (error) {
    console.error("Meal Planner API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}